---
title: "Add Default securityContext"
category: Sample
version: 
subject: Pod
policyType: "mutate"
description: >
    A Pod securityContext entry defines fields such as the user and group which should be used to run the Pod. Sometimes choosing default values for users rather than blocking is a better alternative to not impede such Pod definitions. This policy will mutate a Pod to set `runAsUser`, `runAsGroup`, and `fsGroup` fields within the Pod securityContext if they are not already set.
---

## Policy Definition
<a href="https://github.com/kyverno/policies/raw/main//other/add-default-securitycontext.yaml" target="-blank">/other/add-default-securitycontext.yaml</a>

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: add-default-securitycontext
  annotations:
    policies.kyverno.io/title: Add Default securityContext
    policies.kyverno.io/category: Sample
    policies.kyverno.io/subject: Pod
    policies.kyverno.io/description: >-
      A Pod securityContext entry defines fields such as the user and group which should be used to run the Pod.
      Sometimes choosing default values for users rather than blocking is a better alternative to not impede
      such Pod definitions. This policy will mutate a Pod to set `runAsUser`, `runAsGroup`, and `fsGroup` fields
      within the Pod securityContext if they are not already set.
spec:
  background: false
  rules:
  - name: add-default-securitycontext
    match:
      resources:
        kinds:
        - Pod
    mutate:
      patchStrategicMerge:
        spec:
          securityContext:
            +(runAsUser): 1000
            +(runAsGroup): 3000
            +(fsGroup): 2000

```