// Unit 4: Node.js Core File System (fs) & Async Programming Demonstrations
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const sandboxDir = path.join(__dirname, '../data/fs_sandbox');

// Ensure sandbox directory exists
if (!fs.existsSync(sandboxDir)) {
  fs.mkdirSync(sandboxDir, { recursive: true });
}

// 1. Asynchronous Write File (fs.promises.writeFile)
const writeFileDemo = async (req, res, next) => {
  try {
    const { filename = 'demo.txt', content = 'Hello from Unit 4 Node.js File System!' } = req.body;
    const safeFilename = path.basename(filename);
    const targetPath = path.join(sandboxDir, safeFilename);

    const start = performance.now();
    await fsPromises.writeFile(targetPath, content, 'utf8');
    const elapsed = (performance.now() - start).toFixed(3);

    res.status(200).json({
      success: true,
      method: 'fs.promises.writeFile (Asynchronous)',
      filename: safeFilename,
      bytesWritten: Buffer.byteLength(content, 'utf8'),
      elapsedMs: Number(elapsed),
      message: `File '${safeFilename}' created/overwritten successfully via async I/O.`,
    });
  } catch (err) {
    next(err);
  }
};

// 2. Asynchronous Read File (fs.promises.readFile)
const readFileDemo = async (req, res, next) => {
  try {
    const { filename = 'demo.txt' } = req.query;
    const safeFilename = path.basename(filename);
    const targetPath = path.join(sandboxDir, safeFilename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({
        success: false,
        error: `File '${safeFilename}' does not exist. Please write to it first!`,
      });
    }

    const start = performance.now();
    const content = await fsPromises.readFile(targetPath, 'utf8');
    const elapsed = (performance.now() - start).toFixed(3);

    res.status(200).json({
      success: true,
      method: 'fs.promises.readFile (Asynchronous Non-blocking)',
      filename: safeFilename,
      content,
      elapsedMs: Number(elapsed),
    });
  } catch (err) {
    next(err);
  }
};

// 3. Append to File (fs.promises.appendFile)
const appendFileDemo = async (req, res, next) => {
  try {
    const { filename = 'demo.txt', textToAppend = `\n[Appended at ${new Date().toLocaleTimeString()}]` } = req.body;
    const safeFilename = path.basename(filename);
    const targetPath = path.join(sandboxDir, safeFilename);

    await fsPromises.appendFile(targetPath, textToAppend, 'utf8');
    const updatedContent = await fsPromises.readFile(targetPath, 'utf8');

    res.status(200).json({
      success: true,
      method: 'fs.promises.appendFile (Asynchronous)',
      filename: safeFilename,
      updatedContent,
      message: `Appended content to '${safeFilename}'.`,
    });
  } catch (err) {
    next(err);
  }
};

// 4. Delete File (fs.promises.unlink)
const deleteFileDemo = async (req, res, next) => {
  try {
    const { filename = 'demo.txt' } = req.query;
    const safeFilename = path.basename(filename);
    const targetPath = path.join(sandboxDir, safeFilename);

    if (!fs.existsSync(targetPath)) {
      return res.status(404).json({
        success: false,
        error: `File '${safeFilename}' not found to delete.`,
      });
    }

    await fsPromises.unlink(targetPath);

    res.status(200).json({
      success: true,
      method: 'fs.promises.unlink (Asynchronous)',
      filename: safeFilename,
      message: `File '${safeFilename}' deleted successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// 5. Benchmark: Synchronous (Blocking) vs Asynchronous (Non-blocking)
// Unit 4: "Understanding asynchronous JavaScript - Callbacks and Promises - Introduction to async"
const compareSyncVsAsync = async (req, res, next) => {
  try {
    const testFile = path.join(sandboxDir, 'benchmark_test.txt');
    const dummyPayload = 'Academic Syllabus Benchmarking Line '.repeat(5000);
    await fsPromises.writeFile(testFile, dummyPayload, 'utf8');

    // Sync measurement (Blocks event loop)
    const t0 = performance.now();
    const syncData = fs.readFileSync(testFile, 'utf8');
    const syncTime = (performance.now() - t0).toFixed(4);

    // Async measurement (Non-blocking promise)
    const t1 = performance.now();
    const asyncData = await fsPromises.readFile(testFile, 'utf8');
    const asyncTime = (performance.now() - t1).toFixed(4);

    res.status(200).json({
      success: true,
      topic: 'Unit 4: Asynchronous vs Synchronous I/O in Node.js',
      fileSizeBytes: Buffer.byteLength(syncData),
      results: {
        synchronous: {
          functionUsed: 'fs.readFileSync()',
          behavior: 'Blocks Event Loop thread until disk I/O completes',
          timeMs: Number(syncTime),
        },
        asynchronous: {
          functionUsed: 'fs.promises.readFile()',
          behavior: 'Delegates to Libuv thread pool; does NOT block Event Loop',
          timeMs: Number(asyncTime),
        },
      },
      takeaway: 'Async methods keep Node.js server responsive under high concurrent load.',
    });
  } catch (err) {
    next(err);
  }
};

// 6. List Sandbox Files
const listSandboxFiles = async (req, res, next) => {
  try {
    const files = await fsPromises.readdir(sandboxDir);
    const details = await Promise.all(
      files.map(async (file) => {
        const stat = await fsPromises.stat(path.join(sandboxDir, file));
        return {
          filename: file,
          size: stat.size,
          created: stat.birthtime,
          modified: stat.mtime,
        };
      })
    );
    res.status(200).json({ success: true, count: details.length, files: details });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  writeFileDemo,
  readFileDemo,
  appendFileDemo,
  deleteFileDemo,
  compareSyncVsAsync,
  listSandboxFiles,
};
