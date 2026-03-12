/** @type {import('@commitlint/types').UserConfig} */
// 提交信息使用中文描述，如：feat: 添加用户登录
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'refactor', 'docs', 'test', 'chore', 'perf', 'ci', 'style'],
    ],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 72],
  },
};
