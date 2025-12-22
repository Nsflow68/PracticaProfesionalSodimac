const { portApp } = require("./configServer.json");
let project = 'api_getInfoTrazabilidad';
let repository = 'git@git.dda.sodimac.cl:dda/hansolo/api_getdata.git';

module.exports = {
    apps: [{
        name: `${portApp} - ${project}`,
        script: `/var/node/${project}/source/index.js`,
        kill_timeout: 3000,
        instances: 1,
        output: `/var/node_logs/${project}-out.log`,
        error: `/var/node_logs/${project}-error.log`,
        merge_logs: true,
        log_date_format: "DD-MM-YYYY HH:mm:ss:SSS"
    }],
    deploy: {
        production: {
            "host": "hansolo.dda.sodimac.cl",
            "user": "desarrollo",
            "ref": "origin/master",
            "repo": repository,
            "path": `/var/node/${project}`,
            "post-deploy": "npm install; pm2 startOrRestart ecosystem.config.js",
            env: {
              IP: "10.115.43.28",
              PORT: "27017",
              SCHEMA: "SBS",
              USER: "hulkDatabase",
              PASS: "D3s4rr0l10",
            },
        },
        develop: {
            "host": "thanos.dda.sodimac.cl",
            "user": "desarrollo",
            "ref": "origin/develop",
            "repo": repository,
            "path": `/var/node/${project}`,
            "post-deploy": "npm install; pm2 startOrRestart ecosystem.config.js",
            env: {
              IP: "10.115.43.48",
              PORT: "27017",
              SCHEMA: "SBS",
              USER: "hulkDatabase",
              PASS: "D3s4rr0l10"
            },
        }
    }
}
