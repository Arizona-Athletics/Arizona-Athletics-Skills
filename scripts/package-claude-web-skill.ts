#!/usr/bin/env bun

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..");
const skillName = "ua-athletics-web";
const skillFile = join(repoRoot, "skills", skillName, "SKILL.md");
const outputDir = join(repoRoot, "claude-web");
const outputZip = join(outputDir, `${skillName}.zip`);

const skillMarkdown = await readFile(skillFile, "utf8");
validateSkill(skillMarkdown, skillFile);

await mkdir(outputDir, { recursive: true });

const zip = createZip([
  { name: `${skillName}/`, data: Buffer.alloc(0), directory: true },
  { name: `${skillName}/SKILL.md`, data: Buffer.from(skillMarkdown, "utf8") },
]);

await writeFile(outputZip, zip);
console.log(`Wrote ${outputZip}`);

function validateSkill(markdown: string, sourcePath: string) {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(markdown);
  if (!match) {
    throw new Error(`Missing YAML frontmatter in ${sourcePath}`);
  }

  const name = readFrontmatter(match[1], "name");
  const description = readFrontmatter(match[1], "description");

  if (name !== skillName) {
    throw new Error(`Expected skill name ${skillName} in ${sourcePath}, found ${name || "nothing"}`);
  }

  if (!description) {
    throw new Error(`Missing description frontmatter in ${sourcePath}`);
  }
}

function readFrontmatter(frontmatter: string, key: string) {
  const pattern = new RegExp(`^${key}:\\s*(.+?)\\s*$`, "m");
  const match = pattern.exec(frontmatter);
  return match?.[1]?.trim() || "";
}

type ZipEntry = {
  name: string;
  data: Buffer;
  directory?: boolean;
};

function createZip(entries: ZipEntry[]) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const fileName = Buffer.from(entry.name, "utf8");
    const data = entry.data;
    const crc = entry.directory ? 0 : crc32(data);
    const { date, time } = dosDateTime(new Date("2026-01-01T00:00:00Z"));

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, fileName, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(entry.directory ? 0x00100000 : 0x81a40000, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, fileName);
    offset += localHeader.length + fileName.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

function dosDateTime(dateValue: Date) {
  const year = Math.max(dateValue.getUTCFullYear(), 1980);
  const month = dateValue.getUTCMonth() + 1;
  const day = dateValue.getUTCDate();
  const hours = dateValue.getUTCHours();
  const minutes = dateValue.getUTCMinutes();
  const seconds = Math.floor(dateValue.getUTCSeconds() / 2);

  return {
    date: ((year - 1980) << 9) | (month << 5) | day,
    time: (hours << 11) | (minutes << 5) | seconds,
  };
}

function crc32(data: Buffer) {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}
