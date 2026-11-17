# Ansible

Agentless configuration management: playbooks describe packages, users, services, files on hosts.

## Habits

- Idempotent tasks (safe to re-run)
- Inventory + roles kept next to Terraform / IaC, not orphaned
- Prefer clear playbooks over clever one-liners nobody can read later

## With Terraform

Terraform creates the box; Ansible shapes the box. Same area of the repo when possible.

Related: Infrastructure-as-Code, Terraform, Keep-It-Simple
