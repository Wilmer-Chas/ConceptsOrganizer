# Infrastructure as Code (IaC)

Describe servers, networks, and cloud resources in **versioned files**, then apply them — same idea as source control for the environment.

## Why

- Repeatable environments (dev / staging / prod)
- Reviewable changes (PRs on infra)
- Less “click ops” drift

## Keep it in one place

Store Terraform, Ansible, and env config **together in the same area** of the repo (or a dedicated infra repo), not spread across random folders.

Related: Terraform, Ansible, Keep-It-Simple
