/**
 * ESLint 注释规范配置
 */

module.exports = {
  plugins: ['jsdoc', 'eslint-plugin-tsdoc'],
  extends: ['plugin:jsdoc/recommended'],
  rules: {
    // JSDoc 基础规则
    'jsdoc/require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
        contexts: [
          'TSInterfaceDeclaration',
          'TSTypeAliasDeclaration',
          'TSEnumDeclaration',
        ],
        publicOnly: {
          esm: true,
          cjs: true,
          window: true,
        },
      },
    ],
    
    // 参数说明
    'jsdoc/require-param': 'error',
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-param-name': 'error',
    'jsdoc/require-param-type': 'off', // TypeScript 自动推断
    
    // 返回值说明
    'jsdoc/require-returns': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-returns-type': 'off', // TypeScript 自动推断
    
    // 其他规则
    'jsdoc/require-description': [
      'error',
      {
        contexts: ['any'],
        descriptionStyle: 'body',
      },
    ],
    'jsdoc/require-example': [
      'warn',
      {
        contexts: ['MethodDefinition[key.name=/^(create|update|delete)/]'],
      },
    ],
    
    // 标签规则
    'jsdoc/check-tag-names': [
      'error',
      {
        definedTags: ['since', 'todo', 'fixme', 'hack', 'warning'],
      },
    ],
    'jsdoc/check-alignment': 'error',
    'jsdoc/check-indentation': 'error',
    'jsdoc/check-line-alignment': 'error',
    
    // TSDoc 规则
    'tsdoc/syntax': 'error',
    
    // 通用注释规则
    'spaced-comment': [
      'error',
      'always',
      {
        line: {
          markers: ['/'],
          exceptions: ['-', '+'],
        },
        block: {
          markers: ['!'],
          exceptions: ['*'],
          balanced: true,
        },
      },
    ],
    
    // 禁止注释掉的代码
    'no-warning-comments': [
      'warn',
      {
        terms: ['todo', 'fixme', 'xxx'],
        location: 'start',
      },
    ],
    
    // 多行注释风格
    'multiline-comment-style': ['error', 'starred-block'],
    
    // 注释位置
    'line-comment-position': [
      'error',
      {
        position: 'above',
        ignorePattern: 'pragma',
        applyDefaultIgnorePatterns: true,
      },
    ],
    
    // 注释前空行
    'lines-around-comment': [
      'error',
      {
        beforeBlockComment: true,
        afterBlockComment: false,
        beforeLineComment: true,
        afterLineComment: false,
        allowBlockStart: true,
        allowBlockEnd: false,
        allowObjectStart: true,
        allowObjectEnd: false,
        allowArrayStart: true,
        allowArrayEnd: false,
      },
    ],
  },
  
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      rules: {
        'jsdoc/require-jsdoc': 'off',
        'jsdoc/require-example': 'off',
      },
    },
  ],
};