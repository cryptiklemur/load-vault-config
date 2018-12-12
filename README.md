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
$ ENVIRONMENT=production loadVaultConfigs config.yaml
```

Which will output:

```bash
FOO="value of the secret in secret/production foo"
BAR="value of the secret in secret/baz bar"
```