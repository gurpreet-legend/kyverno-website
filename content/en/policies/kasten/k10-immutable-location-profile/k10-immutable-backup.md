---
title: "Check Immutable Location Profile"
category: Kasten K10 by Veeam
version: 1.6.2
subject: Profile
policyType: "validate"
description: >
    K10 Object Storage Location Profiles store K10 RestorePoints (App Backups) for import and export operations. AWS S3 or S3 compatible object storage that supports object lock can store immutable backups.  Immutability is typically not enabled by default due to the increased costs of retaining storage.  This policy checks that the Profile contains a 'protectionPeriod' which is the main configuration for immutability. 
---

## Policy Definition
<a href="https://github.com/kyverno/policies/raw/main//kasten/k10-immutable-location-profile/k10-immutable-backup.yaml" target="-blank">/kasten/k10-immutable-location-profile/k10-immutable-backup.yaml</a>

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata:
  name: k10-immutable-location-profile
  annotations:
    policies.kyverno.io/title: Check Immutable Location Profile
    policies.kyverno.io/category: Kasten K10 by Veeam
    kyverno.io/kyverno-version: 1.6.2
    policies.kyverno.io/minversion: 1.6.2
    kyverno.io/kubernetes-version: "1.21-1.22"
    policies.kyverno.io/subject: Profile
    policies.kyverno.io/description: >-
      K10 Object Storage Location Profiles store K10 RestorePoints (App Backups) for import and export operations.
      AWS S3 or S3 compatible object storage that supports object lock can store immutable backups. 
      Immutability is typically not enabled by default due to the increased costs of retaining storage. 
      This policy checks that the Profile contains a 'protectionPeriod' which is the main configuration for immutability. 
spec:
  validationFailureAction: audit
  rules:
  - name: k10-immutable-location-profile
    match:
      any: 
      - resources:
          kinds:
          - config.kio.kasten.io/v1alpha1/Profile
    validate:
      message: "Location Profile is not immutable (err: did not configure 'protectionPeriod')"
      pattern:
        spec:
          type: Location
          locationSpec:
            location:
              locationType: ObjectStore
              objectStore:
                protectionPeriod: "?*" # any value determines immutability is enabled 

```
