# Terraform

Declarative IaC tool: you write desired cloud/resources state; Terraform plans and applies the diff.

## Habits

- State is precious — protect it (remote backend, locking)
- Small modules over mega-files when it helps reuse
- `plan` before `apply`
- Keep env-specific vars clear (dev vs prod)

## With Ansible

Terraform often provisions machines/networks; Ansible configures what’s on them. Keep both under the same infra area.

Related: Infrastructure-as-Code, Ansible
