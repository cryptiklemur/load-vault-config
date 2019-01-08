# load-vault-config
[![Build Status](https://travis-ci.org/aequasi/load-vault-config.svg?branch=master)](https://travis-ci.org/aequasi/load-vault-config)

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

$ VAULT_ROLE_ID=role_id VAULT_SECRET_ID=secret_id ENVIRONMENT=production loadVaultConfigs config.yaml
```

Note: `VAULT_ADDR` is not required. Will be the default vault address by default. One of the authentication methods must be used though (token or approle)

Which will output:

```bash
FOO="value of the secret in secret/production foo"
BAR="value of the secret in secret/baz bar"
```
