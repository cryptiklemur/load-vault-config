const YAML = require('yaml');
const InitializeVault = require('node-vault');
const {execSync} = require('child_process');
const {resolve} = require('path');

async function run(configPath) {
    const values = {};

    // Connect to vault
    const vault = InitializeVault({endpoint: process.env.VAULT_ADDR, token: process.env.VAULT_TOKEN});

    // Log in to vault
    if (process.env.VAULT_ROLE_ID) {
        await vault.approleLogin({role_id: process.env.VAULT_ROLE_ID, secret_id: process.env.VAULT_SECRET_ID});
    }

    const yaml = execSync(`cat ${configPath}`).toString();
    const config = YAML.parse(yaml);
    const result = [];

    for (const x of Object.keys(config.secrets)) {
        const re = /%([A-Za-z-_]+)%/g;
        for (const index of Object.keys(config.secrets[x])) {
            let m;
            while ((m = re.exec(config.secrets[x][index])) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                }

                config.secrets[x][index] = config.secrets[x][index].replace(m[0], process.env[m[1]]);
            }
        }

        const path = config.secrets[x].path;
        const key = config.secrets[x].key;
        if (!values[path]) {
            values[path] = (await vault.read(path)).data;
        }

        result.push(`${key}="${values[path][key]}"`);
    }

    return result.join("\n");
}

run(resolve(process.cwd(), process.argv[2])).then(console.log).catch(console.error);