import dedent from 'ts-dedent';
import path from 'path';
import * as storybookMain from '../util/getStorybookMain';

import { transformPlaywright } from './transformPlaywright';

jest.mock('@storybook/core-common', () => ({
  ...jest.requireActual('@storybook/core-common'),
  getProjectRoot: jest.fn(() => '/foo/bar'),
  normalizeStories: jest.fn(() => [
    {
      titlePrefix: 'Example',
      files: '**/*.stories.@(mdx|tsx|ts|jsx|js)',
      directory: './stories/basic',
      importPathMatcher:
        /^\.[\\/](?:stories\/basic(?:\/(?!\.)(?:(?:(?!(?:^|\/)\.).)*?)\/|\/|$)(?!\.)(?=.)[^/]*?\.stories\.(mdx|tsx|ts|jsx|js))$/,
    },
  ]),
}));

jest.mock('../util/getTestRunnerConfig');

expect.addSnapshotSerializer({
  print: (val: unknown) => (typeof val === 'string' ? val.trim() : String(val)),
  test: () => true,
});

describe('Playwright', () => {
  const filename = './stories/basic/Header.stories.js';
  beforeEach(() => {
    const relativeSpy = jest.spyOn(path, 'relative');
    relativeSpy.mockReturnValueOnce('stories/basic/Header.stories.js');
    jest.spyOn(storybookMain, 'getStorybookMain').mockImplementation(() => ({
      stories: [
        {
          directory: '../stories/basic',
          titlePrefix: 'Example',
        },
      ],
    }));

    delete process.env.STORYBOOK_INCLUDE_TAGS;
    delete process.env.STORYBOOK_EXCLUDE_TAGS;
    delete process.env.STORYBOOK_SKIP_TAGS;
  });

  describe('tag filtering mechanism', () => {
    it('should include all stories when there is no tag filtering', () => {
      expect(
        transformPlaywright(
          dedent`
        export default { title: 'foo/bar', component: Button };
        export const A = { };
        export const B = { };
      `,
          filename
        )
      ).toMatchInlineSnapshot(`
        if (!require.main) {
          describe("Example/foo/bar", () => {
            describe("A", () => {
              it("smoke-test", async () => {
                const testFn = async () => {
                  const context = {
                    id: "example-foo-bar--a",
                    title: "Example/foo/bar",
                    name: "A"
                  };
                  const onPageError = err => {
                    globalThis.__sbThrowUncaughtPageError(err, context);
                  };
                  page.on('pageerror', onPageError);
                  if (globalThis.__sbPreVisit) {
                    await globalThis.__sbPreVisit(page, context);
                  }
                  const result = await page.evaluate(({
                    id,
                    hasPlayFn
                  }) => __test(id, hasPlayFn), {
                    id: "example-foo-bar--a"
                  });
                  if (globalThis.__sbPostVisit) {
                    await globalThis.__sbPostVisit(page, context);
                  }
                  if (globalThis.__sbCollectCoverage) {
                    const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                    if (!isCoverageSetupCorrectly) {
                      throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
          The code in this story is not instrumented, which means the coverage setup is likely not correct.
          More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                    }
                    await jestPlaywright.saveCoverage(page);
                  }
                  page.off('pageerror', onPageError);
                  return result;
                };
                try {
                  await testFn();
                } catch (err) {
                  if (err.toString().includes('Execution context was destroyed')) {
                    console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"A"}". Retrying...\`);
                    await jestPlaywright.resetPage();
                    await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                    await testFn();
                  } else {
                    throw err;
                  }
                }
              });
            });
            describe("B", () => {
              it("smoke-test", async () => {
                const testFn = async () => {
                  const context = {
                    id: "example-foo-bar--b",
                    title: "Example/foo/bar",
                    name: "B"
                  };
                  const onPageError = err => {
                    globalThis.__sbThrowUncaughtPageError(err, context);
                  };
                  page.on('pageerror', onPageError);
                  if (globalThis.__sbPreVisit) {
                    await globalThis.__sbPreVisit(page, context);
                  }
                  const result = await page.evaluate(({
                    id,
                    hasPlayFn
                  }) => __test(id, hasPlayFn), {
                    id: "example-foo-bar--b"
                  });
                  if (globalThis.__sbPostVisit) {
                    await globalThis.__sbPostVisit(page, context);
                  }
                  if (globalThis.__sbCollectCoverage) {
                    const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                    if (!isCoverageSetupCorrectly) {
                      throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
          The code in this story is not instrumented, which means the coverage setup is likely not correct.
          More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                    }
                    await jestPlaywright.saveCoverage(page);
                  }
                  page.off('pageerror', onPageError);
                  return result;
                };
                try {
                  await testFn();
                } catch (err) {
                  if (err.toString().includes('Execution context was destroyed')) {
                    console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"B"}". Retrying...\`);
                    await jestPlaywright.resetPage();
                    await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                    await testFn();
                  } else {
                    throw err;
                  }
                }
              });
            });
          });
        }
      `);
    });
    it('should exclude stories when excludeTags matches', () => {
      process.env.STORYBOOK_EXCLUDE_TAGS = 'exclude-test';
      expect(
        transformPlaywright(
          dedent`
        export default { title: 'foo/bar', component: Button };
        export const A = { tags: ['exclude-test'] };
        export const B = { };
      `,
          filename
        )
      ).toMatchInlineSnapshot(`
        if (!require.main) {
          describe("Example/foo/bar", () => {
            describe("B", () => {
              it("smoke-test", async () => {
                const testFn = async () => {
                  const context = {
                    id: "example-foo-bar--b",
                    title: "Example/foo/bar",
                    name: "B"
                  };
                  const onPageError = err => {
                    globalThis.__sbThrowUncaughtPageError(err, context);
                  };
                  page.on('pageerror', onPageError);
                  if (globalThis.__sbPreVisit) {
                    await globalThis.__sbPreVisit(page, context);
                  }
                  const result = await page.evaluate(({
                    id,
                    hasPlayFn
                  }) => __test(id, hasPlayFn), {
                    id: "example-foo-bar--b"
                  });
                  if (globalThis.__sbPostVisit) {
                    await globalThis.__sbPostVisit(page, context);
                  }
                  if (globalThis.__sbCollectCoverage) {
                    const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                    if (!isCoverageSetupCorrectly) {
                      throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
          The code in this story is not instrumented, which means the coverage setup is likely not correct.
          More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                    }
                    await jestPlaywright.saveCoverage(page);
                  }
                  page.off('pageerror', onPageError);
                  return result;
                };
                try {
                  await testFn();
                } catch (err) {
                  if (err.toString().includes('Execution context was destroyed')) {
                    console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"B"}". Retrying...\`);
                    await jestPlaywright.resetPage();
                    await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                    await testFn();
                  } else {
                    throw err;
                  }
                }
              });
            });
          });
        }
      `);
    });
    it('should skip stories when skipTags matches', () => {
      process.env.STORYBOOK_SKIP_TAGS = 'skip-test';
      expect(
        transformPlaywright(
          dedent`
        export default { title: 'foo/bar', component: Button };
        export const A = { tags: ['skip-test'] };
        export const B = { };
      `,
          filename
        )
      ).toMatchInlineSnapshot(`
        if (!require.main) {
          describe("Example/foo/bar", () => {
            describe("A", () => {
              it.skip("smoke-test", async () => {
                const testFn = async () => {
                  const context = {
                    id: "example-foo-bar--a",
                    title: "Example/foo/bar",
                    name: "A"
                  };
                  const onPageError = err => {
                    globalThis.__sbThrowUncaughtPageError(err, context);
                  };
                  page.on('pageerror', onPageError);
                  if (globalThis.__sbPreVisit) {
                    await globalThis.__sbPreVisit(page, context);
                  }
                  const result = await page.evaluate(({
                    id,
                    hasPlayFn
                  }) => __test(id, hasPlayFn), {
                    id: "example-foo-bar--a"
                  });
                  if (globalThis.__sbPostVisit) {
                    await globalThis.__sbPostVisit(page, context);
                  }
                  if (globalThis.__sbCollectCoverage) {
                    const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                    if (!isCoverageSetupCorrectly) {
                      throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
          The code in this story is not instrumented, which means the coverage setup is likely not correct.
          More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                    }
                    await jestPlaywright.saveCoverage(page);
                  }
                  page.off('pageerror', onPageError);
                  return result;
                };
                try {
                  await testFn();
                } catch (err) {
                  if (err.toString().includes('Execution context was destroyed')) {
                    console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"A"}". Retrying...\`);
                    await jestPlaywright.resetPage();
                    await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                    await testFn();
                  } else {
                    throw err;
                  }
                }
              });
            });
            describe("B", () => {
              it("smoke-test", async () => {
                const testFn = async () => {
                  const context = {
                    id: "example-foo-bar--b",
                    title: "Example/foo/bar",
                    name: "B"
                  };
                  const onPageError = err => {
                    globalThis.__sbThrowUncaughtPageError(err, context);
                  };
                  page.on('pageerror', onPageError);
                  if (globalThis.__sbPreVisit) {
                    await globalThis.__sbPreVisit(page, context);
                  }
                  const result = await page.evaluate(({
                    id,
                    hasPlayFn
                  }) => __test(id, hasPlayFn), {
                    id: "example-foo-bar--b"
                  });
                  if (globalThis.__sbPostVisit) {
                    await globalThis.__sbPostVisit(page, context);
                  }
                  if (globalThis.__sbCollectCoverage) {
                    const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                    if (!isCoverageSetupCorrectly) {
                      throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
          The code in this story is not instrumented, which means the coverage setup is likely not correct.
          More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                    }
                    await jestPlaywright.saveCoverage(page);
                  }
                  page.off('pageerror', onPageError);
                  return result;
                };
                try {
                  await testFn();
                } catch (err) {
                  if (err.toString().includes('Execution context was destroyed')) {
                    console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"B"}". Retrying...\`);
                    await jestPlaywright.resetPage();
                    await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                    await testFn();
                  } else {
                    throw err;
                  }
                }
              });
            });
          });
        }
      `);
    });
    it('should work in conjunction with includeTags, excludeTags and skipTags', () => {
      process.env.STORYBOOK_INCLUDE_TAGS = 'play,design';
      process.env.STORYBOOK_SKIP_TAGS = 'skip';
      process.env.STORYBOOK_EXCLUDE_TAGS = 'exclude';
      // Should result in:
      // - A being excluded
      // - B being included, but skipped
      // - C being included
      // - D being excluded
      expect(
        transformPlaywright(
          dedent`
        export default { title: 'foo/bar', component: Button };
        export const A = { tags: ['play', 'exclude'] };
        export const B = { tags: ['play', 'skip'] };
        export const C = { tags: ['design'] };
        export const D = { };
      `,
          filename
        )
      ).toMatchInlineSnapshot(`
        if (!require.main) {
          describe("Example/foo/bar", () => {
            describe("B", () => {
              it.skip("smoke-test", async () => {
                const testFn = async () => {
                  const context = {
                    id: "example-foo-bar--b",
                    title: "Example/foo/bar",
                    name: "B"
                  };
                  const onPageError = err => {
                    globalThis.__sbThrowUncaughtPageError(err, context);
                  };
                  page.on('pageerror', onPageError);
                  if (globalThis.__sbPreVisit) {
                    await globalThis.__sbPreVisit(page, context);
                  }
                  const result = await page.evaluate(({
                    id,
                    hasPlayFn
                  }) => __test(id, hasPlayFn), {
                    id: "example-foo-bar--b"
                  });
                  if (globalThis.__sbPostVisit) {
                    await globalThis.__sbPostVisit(page, context);
                  }
                  if (globalThis.__sbCollectCoverage) {
                    const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                    if (!isCoverageSetupCorrectly) {
                      throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
          The code in this story is not instrumented, which means the coverage setup is likely not correct.
          More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                    }
                    await jestPlaywright.saveCoverage(page);
                  }
                  page.off('pageerror', onPageError);
                  return result;
                };
                try {
                  await testFn();
                } catch (err) {
                  if (err.toString().includes('Execution context was destroyed')) {
                    console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"B"}". Retrying...\`);
                    await jestPlaywright.resetPage();
                    await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                    await testFn();
                  } else {
                    throw err;
                  }
                }
              });
            });
            describe("C", () => {
              it("smoke-test", async () => {
                const testFn = async () => {
                  const context = {
                    id: "example-foo-bar--c",
                    title: "Example/foo/bar",
                    name: "C"
                  };
                  const onPageError = err => {
                    globalThis.__sbThrowUncaughtPageError(err, context);
                  };
                  page.on('pageerror', onPageError);
                  if (globalThis.__sbPreVisit) {
                    await globalThis.__sbPreVisit(page, context);
                  }
                  const result = await page.evaluate(({
                    id,
                    hasPlayFn
                  }) => __test(id, hasPlayFn), {
                    id: "example-foo-bar--c"
                  });
                  if (globalThis.__sbPostVisit) {
                    await globalThis.__sbPostVisit(page, context);
                  }
                  if (globalThis.__sbCollectCoverage) {
                    const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                    if (!isCoverageSetupCorrectly) {
                      throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
          The code in this story is not instrumented, which means the coverage setup is likely not correct.
          More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                    }
                    await jestPlaywright.saveCoverage(page);
                  }
                  page.off('pageerror', onPageError);
                  return result;
                };
                try {
                  await testFn();
                } catch (err) {
                  if (err.toString().includes('Execution context was destroyed')) {
                    console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"C"}". Retrying...\`);
                    await jestPlaywright.resetPage();
                    await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                    await testFn();
                  } else {
                    throw err;
                  }
                }
              });
            });
          });
        }
      `);
    });
    it('should no op when includeTags is passed but not matched', () => {
      process.env.STORYBOOK_INCLUDE_TAGS = 'play';
      expect(
        transformPlaywright(
          dedent`
        export default { title: 'foo/bar', component: Button };
        export const A = () => {};
        A.play = () => {};
      `,
          filename
        )
      ).toMatchInlineSnapshot(`describe.skip('Example/foo/bar', () => { it('no-op', () => {}) });`);
    });
  });

  it('should generate a play test when the story has a play function', () => {
    expect(
      transformPlaywright(
        dedent`
        export default { title: 'foo/bar', component: Button };
        export const A = () => {};
        A.play = () => {};
      `,
        filename
      )
    ).toMatchInlineSnapshot(`
      if (!require.main) {
        describe("Example/foo/bar", () => {
          describe("A", () => {
            it("play-test", async () => {
              const testFn = async () => {
                const context = {
                  id: "example-foo-bar--a",
                  title: "Example/foo/bar",
                  name: "A"
                };
                const onPageError = err => {
                  globalThis.__sbThrowUncaughtPageError(err, context);
                };
                page.on('pageerror', onPageError);
                if (globalThis.__sbPreVisit) {
                  await globalThis.__sbPreVisit(page, context);
                }
                const result = await page.evaluate(({
                  id,
                  hasPlayFn
                }) => __test(id, hasPlayFn), {
                  id: "example-foo-bar--a"
                });
                if (globalThis.__sbPostVisit) {
                  await globalThis.__sbPostVisit(page, context);
                }
                if (globalThis.__sbCollectCoverage) {
                  const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                  if (!isCoverageSetupCorrectly) {
                    throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
        The code in this story is not instrumented, which means the coverage setup is likely not correct.
        More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                  }
                  await jestPlaywright.saveCoverage(page);
                }
                page.off('pageerror', onPageError);
                return result;
              };
              try {
                await testFn();
              } catch (err) {
                if (err.toString().includes('Execution context was destroyed')) {
                  console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"A"}". Retrying...\`);
                  await jestPlaywright.resetPage();
                  await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                  await testFn();
                } else {
                  throw err;
                }
              }
            });
          });
        });
      }
    `);
  });
  it('should generate a smoke test when story does not have a play function', () => {
    expect(
      transformPlaywright(
        dedent`
        export default { title: 'foo/bar' };
        export const A = () => {};
      `,
        filename
      )
    ).toMatchInlineSnapshot(`
      if (!require.main) {
        describe("Example/foo/bar", () => {
          describe("A", () => {
            it("smoke-test", async () => {
              const testFn = async () => {
                const context = {
                  id: "example-foo-bar--a",
                  title: "Example/foo/bar",
                  name: "A"
                };
                const onPageError = err => {
                  globalThis.__sbThrowUncaughtPageError(err, context);
                };
                page.on('pageerror', onPageError);
                if (globalThis.__sbPreVisit) {
                  await globalThis.__sbPreVisit(page, context);
                }
                const result = await page.evaluate(({
                  id,
                  hasPlayFn
                }) => __test(id, hasPlayFn), {
                  id: "example-foo-bar--a"
                });
                if (globalThis.__sbPostVisit) {
                  await globalThis.__sbPostVisit(page, context);
                }
                if (globalThis.__sbCollectCoverage) {
                  const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                  if (!isCoverageSetupCorrectly) {
                    throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
        The code in this story is not instrumented, which means the coverage setup is likely not correct.
        More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                  }
                  await jestPlaywright.saveCoverage(page);
                }
                page.off('pageerror', onPageError);
                return result;
              };
              try {
                await testFn();
              } catch (err) {
                if (err.toString().includes('Execution context was destroyed')) {
                  console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/foo/bar"}/\${"A"}". Retrying...\`);
                  await jestPlaywright.resetPage();
                  await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                  await testFn();
                } else {
                  throw err;
                }
              }
            });
          });
        });
      }
    `);
  });
  it('should generate a smoke test with auto title', () => {
    expect(
      transformPlaywright(
        dedent`
        export default { component: Button };
        export const A = () => {};
      `,
        filename
      )
    ).toMatchInlineSnapshot(`
      if (!require.main) {
        describe("Example/Header", () => {
          describe("A", () => {
            it("smoke-test", async () => {
              const testFn = async () => {
                const context = {
                  id: "example-header--a",
                  title: "Example/Header",
                  name: "A"
                };
                const onPageError = err => {
                  globalThis.__sbThrowUncaughtPageError(err, context);
                };
                page.on('pageerror', onPageError);
                if (globalThis.__sbPreVisit) {
                  await globalThis.__sbPreVisit(page, context);
                }
                const result = await page.evaluate(({
                  id,
                  hasPlayFn
                }) => __test(id, hasPlayFn), {
                  id: "example-header--a"
                });
                if (globalThis.__sbPostVisit) {
                  await globalThis.__sbPostVisit(page, context);
                }
                if (globalThis.__sbCollectCoverage) {
                  const isCoverageSetupCorrectly = await page.evaluate(() => '__coverage__' in window);
                  if (!isCoverageSetupCorrectly) {
                    throw new Error(\`[Test runner] An error occurred when evaluating code coverage:
        The code in this story is not instrumented, which means the coverage setup is likely not correct.
        More info: https://github.com/storybookjs/test-runner#setting-up-code-coverage\`);
                  }
                  await jestPlaywright.saveCoverage(page);
                }
                page.off('pageerror', onPageError);
                return result;
              };
              try {
                await testFn();
              } catch (err) {
                if (err.toString().includes('Execution context was destroyed')) {
                  console.log(\`An error occurred in the following story, most likely because of a navigation: "\${"Example/Header"}/\${"A"}". Retrying...\`);
                  await jestPlaywright.resetPage();
                  await globalThis.__sbSetupPage(globalThis.page, globalThis.context);
                  await testFn();
                } else {
                  throw err;
                }
              }
            });
          });
        });
      }
    `);
  });
});
