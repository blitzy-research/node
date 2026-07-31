import '../common/index.mjs';
import { before, describe, it } from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import { cp } from 'node:fs/promises';
import tmpdir from '../common/tmpdir.js';
import fixtures from '../common/fixtures.js';
const skipIfNoInspector = {
  skip: !process.features.inspector ? 'inspector disabled' : false
};

tmpdir.refresh();

async function setupFixtures() {
  const fixtureDir = fixtures.path('test-runner', 'coverage-default-exclusion');
  await cp(fixtureDir, tmpdir.path, { recursive: true });

  // Both copies live below a directory named node_modules on purpose: it keeps them
  // invisible to the test discovery of the cases that run from tmpdir.path, and it
  // reproduces a project whose absolute path contains a node_modules segment.
  const relativeFixtureDir = fixtures.path('test-runner', 'coverage-relative-exclusion');
  await cp(relativeFixtureDir, tmpdir.resolve('node_modules', 'project'), { recursive: true });
  await cp(relativeFixtureDir, tmpdir.resolve('node_modules', 'absolute-glob-project'), { recursive: true });
}

describe('test runner coverage default exclusion', skipIfNoInspector, () => {
  before(async () => {
    await setupFixtures();
  });

  it('should override default exclusion setting --test-coverage-exclude', async () => {
    const report = [
      '# start of coverage report',
      '# ---------------------------------------------------------------------------',
      '# file                       | line % | branch % | funcs % | uncovered lines',
      '# ---------------------------------------------------------------------------',
      '# file-test.js               | 100.00 |   100.00 |  100.00 | ',
      '# file.test.mjs              | 100.00 |   100.00 |  100.00 | ',
      '# logic-file.js              |  66.67 |   100.00 |   50.00 | 5-7',
      '# test.cjs                   | 100.00 |   100.00 |  100.00 | ',
      '# test                       |        |          |         | ',
      '#  not-matching-test-name.js | 100.00 |   100.00 |  100.00 | ',
      '# ---------------------------------------------------------------------------',
      '# all files                  |  91.89 |   100.00 |   83.33 | ',
      '# ---------------------------------------------------------------------------',
      '# end of coverage report',
    ].join('\n');


    const args = [
      '--test',
      '--experimental-test-coverage',
      '--test-coverage-exclude=!test/**',
      '--test-reporter=tap',
      '--no-experimental-strip-types',
    ];
    const result = spawnSync(process.execPath, args, {
      env: { ...process.env, NODE_TEST_TMPDIR: tmpdir.path },
      cwd: tmpdir.path
    });

    assert.strictEqual(result.stderr.toString(), '');
    assert(result.stdout.toString().includes(report));
    assert.strictEqual(result.status, 0);
  });

  it('should exclude test files from coverage by default', async () => {
    const report = [
      '# start of coverage report',
      '# --------------------------------------------------------------',
      '# file          | line % | branch % | funcs % | uncovered lines',
      '# --------------------------------------------------------------',
      '# logic-file.js |  66.67 |   100.00 |   50.00 | 5-7',
      '# --------------------------------------------------------------',
      '# all files     |  66.67 |   100.00 |   50.00 | ',
      '# --------------------------------------------------------------',
      '# end of coverage report',
    ].join('\n');

    const args = [
      '--no-experimental-strip-types',
      '--test',
      '--experimental-test-coverage',
      '--test-reporter=tap',
    ];
    const result = spawnSync(process.execPath, args, {
      env: { ...process.env, NODE_TEST_TMPDIR: tmpdir.path },
      cwd: tmpdir.path
    });

    assert.strictEqual(result.stderr.toString(), '');
    assert(result.stdout.toString().includes(report));
    assert.strictEqual(result.status, 0);
  });

  it('should exclude ts test files', async () => {
    const report = [
      '# start of coverage report',
      '# --------------------------------------------------------------',
      '# file          | line % | branch % | funcs % | uncovered lines',
      '# --------------------------------------------------------------',
      '# logic-file.js |  66.67 |   100.00 |   50.00 | 5-7',
      '# --------------------------------------------------------------',
      '# all files     |  66.67 |   100.00 |   50.00 | ',
      '# --------------------------------------------------------------',
      '# end of coverage report',
    ].join('\n');

    const args = [
      '--test',
      '--experimental-test-coverage',
      '--disable-warning=ExperimentalWarning',
      '--test-reporter=tap',
    ];
    const result = spawnSync(process.execPath, args, {
      env: { ...process.env, NODE_TEST_TMPDIR: tmpdir.path },
      cwd: tmpdir.path
    });

    assert.strictEqual(result.stderr.toString(), '');
    assert(result.stdout.toString().includes(report));
    assert.strictEqual(result.status, 0);
  });

  // Regression test for https://github.com/nodejs/node/issues/58654: the default
  // exclusion must be matched against working directory relative paths only, so a
  // directory named test above the project must not exclude the whole project.
  it('should not exclude files because an ancestor directory is named test', async () => {
    const report = [
      '# start of coverage report',
      '# --------------------------------------------------------------',
      '# file          | line % | branch % | funcs % | uncovered lines',
      '# --------------------------------------------------------------',
      '# logic-file.js |  66.67 |   100.00 |   50.00 | 5-7',
      '# --------------------------------------------------------------',
      '# all files     |  66.67 |   100.00 |   50.00 | ',
      '# --------------------------------------------------------------',
      '# end of coverage report',
    ].join('\n');

    const args = [
      '--no-experimental-strip-types',
      '--test',
      '--experimental-test-coverage',
      '--test-reporter=tap',
    ];
    const result = spawnSync(process.execPath, args, {
      env: { ...process.env, NODE_TEST_TMPDIR: tmpdir.path },
      cwd: fixtures.path('test-runner', 'coverage-relative-exclusion')
    });

    assert.strictEqual(result.stderr.toString(), '');
    assert(result.stdout.toString().includes(report));
    assert.strictEqual(result.status, 0);
  });

  // The node_modules exclusion must likewise be decided from the working directory
  // relative path, so an ancestor node_modules directory cannot exclude the project.
  it('should not exclude files because an ancestor directory is named node_modules', async () => {
    const report = [
      '# start of coverage report',
      '# --------------------------------------------------------------',
      '# file          | line % | branch % | funcs % | uncovered lines',
      '# --------------------------------------------------------------',
      '# logic-file.js |  66.67 |   100.00 |   50.00 | 5-7',
      '# --------------------------------------------------------------',
      '# all files     |  66.67 |   100.00 |   50.00 | ',
      '# --------------------------------------------------------------',
      '# end of coverage report',
    ].join('\n');

    const args = [
      '--no-experimental-strip-types',
      '--test',
      '--experimental-test-coverage',
      '--test-reporter=tap',
    ];
    const result = spawnSync(process.execPath, args, {
      env: { ...process.env, NODE_TEST_TMPDIR: tmpdir.path },
      cwd: tmpdir.resolve('node_modules', 'project')
    });

    assert.strictEqual(result.stderr.toString(), '');
    assert(result.stdout.toString().includes(report));
    assert.strictEqual(result.status, 0);
  });

  // User supplied globs are documented to match absolute paths as well, and that
  // contract must survive the change above.
  it('should still exclude files matching a user supplied absolute glob', async () => {
    const report = [
      '# start of coverage report',
      '# --------------------------------------------------------------',
      '# file          | line % | branch % | funcs % | uncovered lines',
      '# --------------------------------------------------------------',
      '# file.test.mjs | 100.00 |   100.00 |  100.00 | ',
      '# --------------------------------------------------------------',
      '# all files     | 100.00 |   100.00 |  100.00 | ',
      '# --------------------------------------------------------------',
      '# end of coverage report',
    ].join('\n');

    const args = [
      '--no-experimental-strip-types',
      '--test',
      '--experimental-test-coverage',
      `--test-coverage-exclude=${tmpdir.resolve('node_modules', 'absolute-glob-project', 'logic-file.js')}`,
      '--test-reporter=tap',
    ];
    const result = spawnSync(process.execPath, args, {
      env: { ...process.env, NODE_TEST_TMPDIR: tmpdir.path },
      cwd: tmpdir.resolve('node_modules', 'absolute-glob-project')
    });

    assert.strictEqual(result.stderr.toString(), '');
    assert(result.stdout.toString().includes(report));
    assert.strictEqual(result.status, 0);
  });
});
