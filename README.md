# load-vault-config

This is a small packaged script that lets you load vault secrets into bash environment variables for consumption via other scripts.

### Usage

Create a config file like: 

```yaml
secrets:
    FOO:
        path: "secret/%ENVIRONMENT%"
        key:  "foo"
    BAR:
        path: "secret/baz"
        key:  "bar"
```

Then run: 
```bash
$ VAULT_ADDR=my_vault_addr VAULT_TOKEN=my_vault_token ENVIRONMENT=production loadVaultConfigs config.yaml

// This also works

$ VAULT_ADDR=my_vault_addr VAULT_ROLE_ID=role_id VAULT_SECRET_ID=secret_id ENVIRONMENT=production loadVaultConfigs config.yaml
```

Which will output:

```bash
FOO="value of the secret in secret/production foo"
BAR="value of the secret in secret/baz bar"
```