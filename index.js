const YAML = require('yaml');
const InitializeVault = require('node-vault');
const {execSync} = require('child_process');
const {resolve} = require('path');

if (!process.env.VAULT_ADDR) {
    process.env.VAULT_ADDR = 'https://127.0.0.1:8200'
}
if (!process.env.VAULT_TOKEN && !process.env.VAULT_ROLE_ID) {
    console.error("A vault authentication method must be supplied.");
    process.exit(0);
}

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
            try {
                values[path] = (await vault.read(path)).data;
            } catch (e) {
                console.error(`Failed to read: ${path} - ${key}`, e);
                continue;
            }
        }

        let value = values[path][key];
        if (typeof value === 'string') {
            value = value.replace(/\n/g, '\\n');
        }

        result.push(`${x}="${value}"`);
    }

    return result.join("\n");
}

run(resolve(process.cwd(), process.argv[2])).then(console.log).catch(console.error);