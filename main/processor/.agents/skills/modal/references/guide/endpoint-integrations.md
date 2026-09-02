# Endpoint integrations

OpenAI-compatible coding agents, such as OpenCode and Codex, can connect
directly to your Shared Endpoints. Shared Endpoints are available through
`https://inference.us-west.modal.direct` and are routed on the OpenAI `model`
field, so the model ID is the endpoint's hostname, for example
`my-endpoint.us-west.modal.direct`.

To see which Shared Endpoints a token can reach, list all model IDs with:

```bash
curl "https://inference.us-west.modal.direct/v1/models" \
  -H "Authorization: Bearer $MODAL_PROXY_TOKEN_ID.$MODAL_PROXY_TOKEN_SECRET"
```

## OpenCode

[Install OpenCode](https://opencode.ai/docs/) and create a
[proxy token](/docs/guide/endpoints#proxy-tokens). In the OpenCode CLI, run
`/connect`, select Modal as the
[provider](https://opencode.ai/docs/providers/), and enter the token as the
API key in its combined form, `wk-<id>.ws-<secret>`. Then run `/models` and
select your endpoint by hostname.

For CI or other headless use, set the token in the environment instead of
running `/connect`:

```bash
export MODAL_PROXY_TOKEN="wk-<id>.ws-<secret>"
```

## Codex

[Install Codex](https://learn.chatgpt.com/docs/codex/cli), create a
[proxy token](/docs/guide/endpoints#proxy-tokens), and define Modal as a model
provider in `~/.codex/config.toml`:

```toml
# ~/.codex/config.toml
[model_providers.modal]
name = "Modal"
base_url = "https://inference.us-west.modal.direct/v1"
env_key = "MODAL_PROXY_TOKEN"
wire_api = "responses"
```

Then you can run Codex via the following command with the endpoint hostname as
the model ID:

```bash
export MODAL_PROXY_TOKEN="$MODAL_PROXY_TOKEN_ID.$MODAL_PROXY_TOKEN_SECRET"
codex \
  --model my-endpoint.us-west.modal.direct \
  --config model_provider='"modal"'
```
