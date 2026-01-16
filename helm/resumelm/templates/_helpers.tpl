{{/*
Expand the name of the chart.
*/}}
{{- define "resumelm.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "resumelm.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "resumelm.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "resumelm.labels" -}}
helm.sh/chart: {{ include "resumelm.chart" . }}
{{ include "resumelm.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "resumelm.selectorLabels" -}}
app.kubernetes.io/name: {{ include "resumelm.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "resumelm.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "resumelm.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Database host - supports external database
*/}}
{{- define "resumelm.dbHost" -}}
{{- if and .Values.db.external.enabled .Values.db.external.host }}
{{- .Values.db.external.host }}
{{- else }}
{{- printf "%s-db" (include "resumelm.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Database port - supports external database
*/}}
{{- define "resumelm.dbPort" -}}
{{- if and .Values.db.external.enabled .Values.db.external.port }}
{{- .Values.db.external.port }}
{{- else }}
{{- 5432 }}
{{- end }}
{{- end }}

{{/*
Database name - supports external database
*/}}
{{- define "resumelm.dbName" -}}
{{- if and .Values.db.external.enabled .Values.db.external.database }}
{{- .Values.db.external.database }}
{{- else }}
{{- "postgres" }}
{{- end }}
{{- end }}

{{/*
Redis host - supports external Redis
*/}}
{{- define "resumelm.redisHost" -}}
{{- if and .Values.redis.external.enabled .Values.redis.external.url }}
{{- /* External URL provided - extract will be handled in app template */ -}}
{{- printf "%s-redis" (include "resumelm.fullname" .) }}
{{- else }}
{{- printf "%s-redis" (include "resumelm.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Redis URL - supports external Redis
*/}}
{{- define "resumelm.redisUrl" -}}
{{- if and .Values.redis.external.enabled .Values.redis.external.url }}
{{- .Values.redis.external.url }}
{{- else }}
{{- printf "redis://%s-redis:6379" (include "resumelm.fullname" .) }}
{{- end }}
{{- end }}

{{/*
Kong host
*/}}
{{- define "resumelm.kongHost" -}}
{{- printf "%s-kong" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Auth host
*/}}
{{- define "resumelm.authHost" -}}
{{- printf "%s-auth" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Rest host
*/}}
{{- define "resumelm.restHost" -}}
{{- printf "%s-rest" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Storage host
*/}}
{{- define "resumelm.storageHost" -}}
{{- printf "%s-storage" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Imgproxy host
*/}}
{{- define "resumelm.imgproxyHost" -}}
{{- printf "%s-imgproxy" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Meta host
*/}}
{{- define "resumelm.metaHost" -}}
{{- printf "%s-meta" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Analytics host
*/}}
{{- define "resumelm.analyticsHost" -}}
{{- printf "%s-analytics" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Realtime host
*/}}
{{- define "resumelm.realtimeHost" -}}
{{- printf "%s-realtime" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Inbucket host
*/}}
{{- define "resumelm.inbucketHost" -}}
{{- printf "%s-inbucket" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Secret name
*/}}
{{- define "resumelm.secretName" -}}
{{- printf "%s-secrets" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
ConfigMap name
*/}}
{{- define "resumelm.configMapName" -}}
{{- printf "%s-config" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Kong ConfigMap name
*/}}
{{- define "resumelm.kongConfigMapName" -}}
{{- printf "%s-kong-config" (include "resumelm.fullname" .) }}
{{- end }}

{{/*
Image pull secrets
*/}}
{{- define "resumelm.imagePullSecrets" -}}
{{- with .Values.global.imagePullSecrets }}
imagePullSecrets:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}

{{/*
Storage class
*/}}
{{- define "resumelm.storageClass" -}}
{{- if .Values.global.storageClass }}
storageClassName: {{ .Values.global.storageClass }}
{{- end }}
{{- end }}

{{/*
Namespace - uses global.namespace from values, defaults to release namespace
*/}}
{{- define "resumelm.namespace" -}}
{{- default .Release.Namespace .Values.global.namespace }}
{{- end }}

{{/*
Node selector - applies global node selector to all pods
*/}}
{{- define "resumelm.nodeSelector" -}}
{{- with .Values.global.nodeSelector }}
nodeSelector:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}

{{/*
Affinity - applies global affinity rules to all pods
*/}}
{{- define "resumelm.affinity" -}}
{{- with .Values.global.affinity }}
affinity:
  {{- toYaml . | nindent 2 }}
{{- end }}
{{- end }}
