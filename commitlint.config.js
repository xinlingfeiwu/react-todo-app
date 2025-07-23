export default {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // 新功能
                'fix',      // 修复bug
                'docs',     // 文档更改
                'style',    // 代码样式修改（不影响代码逻辑）
                'refactor', // 重构（既不是新增功能，也不是修复bug的代码修改）
                'perf',     // 性能优化
                'test',     // 测试相关
                'build',    // 构建系统或外部依赖项的更改
                'ci',       // CI配置文件和脚本的更改
                'chore',    // 其他不修改src或测试文件的更改
                'revert'    // 回退之前的提交
            ]
        ],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],
        'scope-case': [2, 'always', 'lower-case'],
        'subject-case': [0],
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'header-max-length': [2, 'always', 100],
        'body-leading-blank': [1, 'always'],
        'footer-leading-blank': [1, 'always']
    },
    prompt: {
        questions: {
            type: {
                description: '选择你要提交的更改类型:',
                enum: {
                    feat: {
                        description: '新功能',
                        title: 'Features',
                        emoji: '✨',
                    },
                    fix: {
                        description: '修复bug',
                        title: 'Bug Fixes',
                        emoji: '🐛',
                    },
                    docs: {
                        description: '文档更改',
                        title: 'Documentation',
                        emoji: '📚',
                    },
                    style: {
                        description: '代码样式修改（不影响代码逻辑）',
                        title: 'Styles',
                        emoji: '💎',
                    },
                    refactor: {
                        description: '重构（既不是新增功能，也不是修复bug的代码修改）',
                        title: 'Code Refactoring',
                        emoji: '📦',
                    },
                    perf: {
                        description: '性能优化',
                        title: 'Performance Improvements',
                        emoji: '🚀',
                    },
                    test: {
                        description: '测试相关',
                        title: 'Tests',
                        emoji: '🚨',
                    },
                    build: {
                        description: '构建系统或外部依赖项的更改',
                        title: 'Builds',
                        emoji: '🛠',
                    },
                    ci: {
                        description: 'CI配置文件和脚本的更改',
                        title: 'Continuous Integrations',
                        emoji: '⚙️',
                    },
                    chore: {
                        description: '其他不修改src或测试文件的更改',
                        title: 'Chores',
                        emoji: '♻️',
                    },
                    revert: {
                        description: '回退之前的提交',
                        title: 'Reverts',
                        emoji: '🗑',
                    },
                },
            },
            scope: {
                description: '此更改的范围是什么（例如组件或文件名）:',
            },
            subject: {
                description: '写一个简短、命令式的更改描述:',
            },
            body: {
                description: '提供更详细的更改描述:',
            },
            isBreaking: {
                description: '是否有破坏性更改?',
            },
            breakingBody: {
                description: '破坏性更改的提交需要一个正文。请输入对提交本身的更长描述:',
            },
            breaking: {
                description: '描述破坏性更改:',
            },
            isIssueAffected: {
                description: '此更改是否影响任何未解决的issue?',
            },
            issuesBody: {
                description: '如果issue已修复，提交需要一个正文。请输入对提交本身的更长描述:',
            },
            issues: {
                description: '添加issue引用 (例如 "fix #123", "re #123"):',
            },
        },
    },
};
