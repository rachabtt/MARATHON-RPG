import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

type JsonObject = Record<string, unknown>;

type BuildSummary = {
  missionId: string;
  scenes: number;
  locations: number;
  resources: number;
  tokens: number;
  assetsCopied: number;
  outputPath: string;
  warnings: number;
};

type ValidationReport = {
  ok: string[];
  warnings: string[];
  errors: string[];
};

function isRecord(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getArrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function getRecordArray(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function assertString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Champ requis invalide: ${fieldName}`);
  }
  return value;
}

function assertNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Champ requis invalide: ${fieldName}`);
  }
  return value;
}

function assertArray(value: unknown, fieldName: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Champ requis invalide: ${fieldName}`);
  }
  return value;
}

function addUniqueIdValidation(
  label: string,
  items: JsonObject[],
  report: ValidationReport
): Set<string> {
  const ids = new Set<string>();
  const duplicates = new Set<string>();
  let missingIds = 0;

  for (const item of items) {
    if (typeof item.id !== 'string' || item.id.trim().length === 0) {
      missingIds += 1;
      continue;
    }

    if (ids.has(item.id)) {
      duplicates.add(item.id);
      continue;
    }

    ids.add(item.id);
  }

  if (missingIds > 0) {
    report.errors.push(`${label}: ${missingIds} entrée(s) sans id valide.`);
  }

  if (duplicates.size > 0) {
    report.errors.push(`${label}: id dupliqué(s): ${Array.from(duplicates).join(', ')}.`);
  } else if (missingIds === 0) {
    report.ok.push(`${label}: ids uniques.`);
  }

  return ids;
}

function addSceneReferenceValidation(
  label: string,
  sceneRef: unknown,
  sceneIds: Set<string>,
  report: ValidationReport
) {
  if (typeof sceneRef !== 'string' || sceneRef.trim().length === 0) return;
  if (!sceneIds.has(sceneRef)) {
    report.errors.push(`${label}: référence de scène inconnue "${sceneRef}".`);
  }
}

function getAssetLocalPath(
  assetPath: string,
  assetsBasePath: string,
  sourceAssetsDir: string
): string | null {
  if (/^(https?:|data:)/i.test(assetPath)) return null;

  if (assetPath.startsWith(assetsBasePath)) {
    const relativePath = assetPath.slice(assetsBasePath.length).replace(/^\/+/, '');
    return path.join(sourceAssetsDir, relativePath);
  }

  if (assetPath.startsWith('/')) return null;

  return path.join(sourceAssetsDir, assetPath);
}

function addAssetPathWarning(
  label: string,
  assetPath: unknown,
  assetsBasePath: string,
  sourceAssetsDir: string,
  report: ValidationReport
) {
  if (typeof assetPath !== 'string' || assetPath.trim().length === 0) return;

  const localPath = getAssetLocalPath(assetPath, assetsBasePath, sourceAssetsDir);
  if (!localPath) return;

  if (!existsSync(localPath)) {
    report.warnings.push(`${label}: asset manquant "${assetPath}" (${path.relative(process.cwd(), localPath)}).`);
  }
}

function validateMissionReferences(data: JsonObject, sourceAssetsDir: string): ValidationReport {
  const report: ValidationReport = {
    ok: [],
    warnings: [],
    errors: []
  };

  const scenes = getRecordArray(data.scenes);
  const locations = getRecordArray(data.locations);
  const tokens = getRecordArray(data.tokens);
  const gmScript = [
    ...getRecordArray(data.gmScript),
    ...getRecordArray(data.gmScriptScenes)
  ];
  const playerIntel = getRecordArray(data.playerIntel);
  const assets = getRecordArray(data.assets);
  const aletheia = isRecord(data.aletheia) ? data.aletheia : {};
  const sceneMap = isRecord(aletheia.sceneMap) ? aletheia.sceneMap : {};
  const assetsBasePath = typeof data.assetsBasePath === 'string' ? data.assetsBasePath : '';

  const sceneIds = addUniqueIdValidation('Scènes', scenes, report);
  const locationIds = addUniqueIdValidation('Lieux', locations, report);
  addUniqueIdValidation('Tokens', tokens, report);

  for (const scriptScene of gmScript) {
    const sceneRef = typeof scriptScene.sceneId === 'string' ? scriptScene.sceneId : scriptScene.id;
    addSceneReferenceValidation(`Script MJ ${String(scriptScene.id ?? '(sans id)')}`, sceneRef, sceneIds, report);
  }
  if (gmScript.length > 0) report.ok.push('Script MJ: références de scènes vérifiées.');

  for (const intel of playerIntel) {
    addSceneReferenceValidation(`Info joueur ${String(intel.id ?? '(sans id)')}`, intel.sceneId, sceneIds, report);
  }
  if (playerIntel.length > 0) report.ok.push('Infos joueur: références de scènes vérifiées.');

  for (const sceneId of Object.keys(sceneMap)) {
    addSceneReferenceValidation('Aletheia sceneMap', sceneId, sceneIds, report);
  }
  if (Object.keys(sceneMap).length > 0) report.ok.push('Aletheia sceneMap: références de scènes vérifiées.');

  for (const token of tokens) {
    const sceneVisibility = token.sceneVisibility;
    if (!Array.isArray(sceneVisibility)) continue;

    for (const sceneId of sceneVisibility) {
      addSceneReferenceValidation(`Token ${String(token.id ?? '(sans id)')} sceneVisibility`, sceneId, sceneIds, report);
    }
  }
  if (tokens.some((token) => Array.isArray(token.sceneVisibility))) {
    report.ok.push('Tokens: sceneVisibility vérifiées.');
  }

  for (const scene of scenes) {
    if (typeof scene.locationId !== 'string' || scene.locationId.trim().length === 0) continue;
    if (!locationIds.has(scene.locationId)) {
      report.errors.push(`Scène ${String(scene.id ?? '(sans id)')}: locationId inconnu "${scene.locationId}".`);
    }
  }
  if (scenes.length > 0) report.ok.push('Scènes: références de lieux vérifiées.');

  for (const asset of assets) {
    const assetId = String(asset.id ?? '(sans id)');
    addAssetPathWarning(`Asset ${assetId}`, asset.src, assetsBasePath, sourceAssetsDir, report);

    if (isRecord(asset.variants)) {
      for (const [variantId, variantPath] of Object.entries(asset.variants)) {
        addAssetPathWarning(`Asset ${assetId} variant ${variantId}`, variantPath, assetsBasePath, sourceAssetsDir, report);
      }
    }
  }

  if (report.warnings.length === 0) {
    report.ok.push('Assets: aucun asset local manquant détecté.');
  }

  return report;
}

function printValidationReport(report: ValidationReport) {
  for (const message of report.ok) {
    console.log(`✅ ${message}`);
  }

  for (const message of report.warnings) {
    console.warn(`⚠️ ${message}`);
  }

  for (const message of report.errors) {
    console.error(`❌ ${message}`);
  }
}

function readMissionSource(sourcePath: string): JsonObject {
  if (!existsSync(sourcePath)) {
    throw new Error(`mission.source.json introuvable: ${path.relative(process.cwd(), sourcePath)}`);
  }

  let data: unknown;
  try {
    const raw = readFileSync(sourcePath, 'utf8');
    data = JSON.parse(raw) as unknown;
  } catch (error) {
    throw new Error(`mission.source.json invalide: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!isRecord(data)) {
    throw new Error('mission.source.json doit contenir un objet JSON.');
  }
  return data;
}

function validateMissionSource(data: JsonObject, requestedMissionId: string): string {
  const metadata = data.metadata;
  if (!isRecord(metadata)) {
    throw new Error('Champ requis invalide: metadata');
  }

  const missionId = assertString(metadata.id, 'metadata.id');
  assertString(metadata.title, 'metadata.title');
  assertString(metadata.season, 'metadata.season');
  assertNumber(metadata.number, 'metadata.number');
  assertString(data.assetsBasePath, 'assetsBasePath');
  assertArray(data.scenes, 'scenes');
  assertArray(data.locations, 'locations');

  if (missionId !== requestedMissionId) {
    throw new Error(`metadata.id (${missionId}) ne correspond pas au dossier demandé (${requestedMissionId}).`);
  }

  return missionId;
}

function copyAssetsRecursive(sourceDir: string, targetDir: string): number {
  if (!existsSync(sourceDir)) return 0;

  mkdirSync(targetDir, { recursive: true });
  let copied = 0;

  for (const entry of readdirSync(sourceDir)) {
    const sourcePath = path.join(sourceDir, entry);
    const targetPath = path.join(targetDir, entry);
    const entryStat = statSync(sourcePath);

    if (entryStat.isDirectory()) {
      copied += copyAssetsRecursive(sourcePath, targetPath);
      continue;
    }

    if (!entryStat.isFile()) continue;
    mkdirSync(path.dirname(targetPath), { recursive: true });
    copyFileSync(sourcePath, targetPath);
    copied += 1;
  }

  return copied;
}

function buildMission(missionId: string): BuildSummary {
  const rootDir = process.cwd();
  const sourceDir = path.join(rootDir, 'missions-src', missionId);
  const publicMissionDir = path.join(rootDir, 'public', 'missions', missionId);
  const sourcePath = path.join(sourceDir, 'mission.source.json');
  const outputPath = path.join(publicMissionDir, 'mission.json');

  if (!existsSync(sourceDir)) {
    throw new Error(`Dossier source introuvable: ${path.relative(rootDir, sourceDir)}`);
  }

  const missionSource = readMissionSource(sourcePath);
  const validatedMissionId = validateMissionSource(missionSource, missionId);

  const sourceAssetsDir = path.join(sourceDir, 'assets');
  const publicAssetsDir = path.join(publicMissionDir, 'assets');
  const validationReport = validateMissionReferences(missionSource, sourceAssetsDir);
  printValidationReport(validationReport);

  if (validationReport.errors.length > 0) {
    throw new Error(`${validationReport.errors.length} erreur(s) bloquante(s) dans la mission.`);
  }

  rmSync(publicAssetsDir, { recursive: true, force: true });
  const assetsCopied = copyAssetsRecursive(sourceAssetsDir, publicAssetsDir);

  mkdirSync(publicMissionDir, { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(missionSource, null, 2)}\n`, 'utf8');

  return {
    missionId: validatedMissionId,
    scenes: getArrayLength(missionSource.scenes),
    locations: getArrayLength(missionSource.locations),
    resources: getArrayLength(missionSource.resources),
    tokens: getArrayLength(missionSource.tokens),
    assetsCopied,
    outputPath,
    warnings: validationReport.warnings.length
  };
}

function printUsage() {
  console.log('Usage: npm run build:mission -- mission-02-cold-storage');
}

function printSummary(summary: BuildSummary) {
  console.log('');
  console.log(`Mission compilée: ${summary.missionId}`);
  console.log(`Scènes: ${summary.scenes}`);
  console.log(`Lieux: ${summary.locations}`);
  console.log(`Ressources: ${summary.resources}`);
  console.log(`Tokens: ${summary.tokens}`);
  console.log(`Assets copiés: ${summary.assetsCopied}`);
  console.log(`Warnings: ${summary.warnings}`);
  console.log(`Sortie: ${path.relative(process.cwd(), summary.outputPath)}`);
  console.log('');
}

const missionId = process.argv[2]?.trim();

if (!missionId) {
  printUsage();
  process.exit(1);
} else {
  try {
    printSummary(buildMission(missionId));
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('Erreur de compilation mission:');
    console.error(error instanceof Error ? error.message : String(error));
    console.error('');
    process.exit(1);
  }
}
