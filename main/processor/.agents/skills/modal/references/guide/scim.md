# SCIM Integration

<Callout variant="gated-feature">
SCIM support is available on the <a href="/pricing">Enterprise plan</a>. Contact <a href="mailto:sales@modal.com">sales@modal.com</a> for more information.
</Callout>

<Callout variant="beta" />

[SCIM (System for Cross-domain Identity Management)](https://datatracker.ietf.org/doc/html/rfc7643) is a protocol that Identity Providers (IdPs) can use to automate user management in connected apps.

Modal supports SCIM for automatic provisioning and deprovisioning of users.

## Connecting an IdP

### Step 1: Generate a SCIM token

1. Sign in to https://modal.com and visit your [Workspace Management](/settings/workspace-management/identity-and-provisioning) page's `Identity and Provisioning` tab. If SCIM is enabled for your Workspace, there will be a "SCIM Tokens" section on the page below the SSO configuration settings. If you do not see a section for SCIM tokens, contact Modal support about enabling SCIM support for your Workspace.
2. Click on "New SCIM Token" then "Create Token".
3. A new token will be generated and displayed to you. Copy the value from the "Token Secret" box and store it somewhere secure. You can also copy the exact url that the IdP will require to integrate with your Modal Workspace. Once you click "Done", you will not be able to view the token secret again and will have to generate a new one if you can't otherwise access it.

### Step 2: IdP Configuration

Exact configuration steps will vary by IdP. Your IdP will require you to provide at least a SCIM url (Which will be of the form `https://modal.com/api/<your-workspace>/scim/v2`) and the token generated in step 1.

Settings for common IdP integration configuration fields are listed below.

| Configuration Setting                | Modal Supported | Value                                            | Notes                                      |
| ------------------------------------ | --------------- | ------------------------------------------------ | ------------------------------------------ |
| SCIM Version                         | Yes             | 2                                                |
| SCIM Base URL                        | Yes             | `https://modal.com/api/<your-workspace>/scim/v2` |
| Scim Authorization Method            | Yes             | Bearer Token                                     |
| Supports Pagination                  | Yes             |                                                  |
| Supports Groups                      | No              |                                                  | Group support will be added in the future. |
| Create & Delete Groups               | No              |                                                  | Group support will be added in the future. |
| Use PATCH to edit Groups             | No              |                                                  | Group support will be added in the future. |
| Generate temporary password          | No              |                                                  |
| Username to use for account creation | Yes             | Email address                                    |

The IdP may also ask you to specify which user attributes are supported.

| SCIM user attribute | Modal Supported | Notes                                      |
| ------------------- | --------------- | ------------------------------------------ |
| externalId          | Yes             |                                            |
| userName            | Yes             |                                            |
| displayName         | Yes             |                                            |
| familyName          | Yes             |                                            |
| givenName           | Yes             |                                            |
| emails              | No              | Primary email is set in the userName field |
| active              | Yes             |                                            |
| addresses           | No              |                                            |
| profileUrl          | No              |                                            |

## Managing Tokens

Token management is restricted to only workspace owners and managers.

Up to two SCIM tokens may be active at any time. It may be useful to generate a second token to facilitate seamless token rotation - a workspace admin can generate a new token, use it to replace the old one in the connected IdP, and finally revoke the old token to ensure that no updates are dropped during the rotation process. Except during the process of rotation we recommend having only one SCIM token active at a time as a security best practice.

## Troubleshooting

If your IdP indicates that it is unable to authenticate with Modal, first double check that the token was copied correctly - the full token will have the form `si-XXXXXXXXXXXXXXXXXXXXXX:ss-XXXXXXXXXXXXXXXXXXXXXX`.

If you experience any issues with or have any questions about SCIM integration, please reach out via [Slack](/slack) or email us at <support@modal.com>.
