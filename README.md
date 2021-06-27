# JS Proxy for Github packages and Unity Scoped Registry
![Node.js CI](https://github.com/codebrewery/UPM-Proxy-GitHub/workflows/Node.js%20CI/badge.svg)

## About

This lightweight proxy ensures Unity 2019, 2020 and 2021 can read your private org packages through the Unity Scoped package manager. There's minimal setup required for the org members.

Unfortunately Github does not support a few NPM endpoints and doesn't seem to have it on their roadmap. Using Github as an uplink in the exquisite [Verdaccio](https://github.com/verdaccio/verdaccio) proxy can be an alternative, however you'll need to either use a reverseproxy to do some magic with URLs or do some custom coding to support UPM.

Since this application is a thin layer of nodeJS and proxies the endpoints and streams the binaries, it could even run serverless on request only.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/codebrewery/UPM-Proxy-GitHub)

## Authentication

As an authentication layer the Github [Personal Access Token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token) is used. A minimum requirement is to allow reading packages scope `read:packages`. This means that org members only have access to packages visible to them.

Never use a proxy that is not maintained by yourself or your company! Github Personal Access Tokens will be traveling through the proxy. Malicious proxy owners could potentially use these to gain access and at the bare minimum, real all the packages you have access to.

Add an entry to `~/.upmconfig.toml` in this format:

```
[npmAuth."HOST/upm/SCOPE"]
token = "TOKEN"
alwaysAuth = true
```

- HOST: The url you decide to publish this app to. ex. `https://www.acme.com/upm/@acmecorp`
- SCOPE: The org name prefixed with @, ex. `@acmecorp`
- TOKEN: The [Personal Access Token](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token) with scope read:packages

More info on the upmconfig on the official [Unity documentation](https://docs.unity3d.com/Manual/upm-config-scoped.html)

## Unity configuration

Scoped Registries in the Package Manager:

- Name: Reference name for the scoped registry
- URL: The full URL needs to be the exact copy of the complete `HOST/upm/SCOPE` url filled in the Authentication step. ex. `https://www.acme.com/upm/@acmecorp`
- Scope(s): The package name filter, ex. `com.acme`

## Creating packages

In order for Unity to read the packages there's a naming convention quirk to take in to account which differs from the standard scope package naming convention.

Changes in the package.json:

**Naming**

Remove the scope from the `name` field

```
"name": "com.my-company.my-package",
```

**Publish Config**

Add the scope to the url in the publishConfig setting in the pack

```
  "publishConfig": { "registry": "https://npm.pkg.github.com/@SCOPE" },
```

More info https://forum.unity.com/threads/using-github-packages-registry-with-unity-package-manager.861076/


## Environment variables

The following server-side environment variables can be set. For development a local `.env` is supported.

- `PORT` (Default: 8080) Server listening port
- `SCOPE` Force the scope to use a certain organisation/user. When not set, everyone out of the org can use the proxy.
- `SCOPE_TYPE` (Default: ORG) Either 'ORG' for organization or 'USER' for a user scoped package.
- `PACKAGE_SCOPE` Displayed on the homepage for instruction purposes for the end-user.
- `CLEAR_TOKEN` A token to clear the cached responses. Useful in a github action after a new package has been published.
- `CACHE_TTL` (Default: 7200) The ttl for keeping data in memory cache in seconds.

## Disclaimers

- There's currently a max of 100 packages in the /-/all endpoint
- Unity integration tested on macOS, not on windows

## TODO

- Add tests
- Add /search endpoint with paging
- Add docker and/or AWS lambda support
