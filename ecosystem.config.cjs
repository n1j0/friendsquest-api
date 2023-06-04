module.exports = {
    apps: [{
        name: 'friendsquest-api',
        script: './.out/src/index.js',
        instances: 0,
        merge_logs: true,
        env: {
            NODE_ENV: 'production',
            watch: false,
        },
    }],
}
