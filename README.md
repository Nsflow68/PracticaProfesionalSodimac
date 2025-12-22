# Informe de Seguridad y Ethical Hacking

Este repositorio contiene la remediacion y mitigación de vulnerabilidades detectadas durante la evaluación de seguridad Ethical Hacking Web. El código ha sido sanitizado (eliminación de comentarios y rutas sensibles) para su publicación.

A continuación se detalla el informe y el plan de pruebas bajo el cual se ha trabajado:

---

## 1. Plan de pruebas Ethical Hacking Web

En cada evaluación de seguridad o Ethical Hacking realizado por el grupo Falabella se toman en consideración estándares internaciones y metodologías reconocidas mundialmente como lo son NIST, OSSTMM y OWASP, así como las recomendaciones o solicitudes particulares del negocio involucrado. Tomando en cuenta esta información, el plan de pruebas se clasifica en 4 etapas fundamentales que son:

### 1.1. Reconocimiento
En esta fase se recopila toda la información posible que luego será utilizada a lo largo de las siguientes fases. La información que se desea obtener es conocer los servicios activos, protocolos en uso, plataforma implementada, servicios web, direcciones IP, Servidores utilizados y versionado de estos, entre otros.

### 1.2. Escaneo de Vulnerabilidades
Utilizando la información obtenida previamente se buscan posibles vectores de ataque. Esta etapa involucra el escaneo de puertos y servicios, así como la evaluación de los diferentes componentes que conforman el activo a evaluar. Este proceso se divide en dos fases:

- **Análisis de vulnerabilidades automáticas:** En esta fase se realiza un análisis con herramientas como ZAP, Acunetix, Burp Suite, SQLmap, NMAP y Nikto para tener un primer informe de aquellas vulnerabilidades que pueden ser identificadas en primera instancia.
- **Análisis de vulnerabilidades manual:** Posterior al análisis de vulnerabilidades automáticas, se realiza una evaluación de forma manual, tomando como referencia principalmente la OWASP testing guide v4.0 y realizando pruebas de funcionalidad enfocadas al negocio o el tipo de servicio evaluado. De esta forma nos aseguramos de que no existan falsos positivos y falsos negativos. Las principales técnicas utilizadas en el análisis de seguridad de aplicaciones web son:
    - Inyección SQL.
    - Ejecución de scripts entre sitios (XSS).
    - Gestión de sesiones y almacenamiento de datos.
    - Revisión de los mecanismos de autenticación y autorización.
    - Referencia insegura y directa a objetos.
    - Configuraciones inseguras.
    - Análisis de tráfico.
    - Almacenamiento criptográfico inseguro.
    - Falla en la restricción de acceso a URLs.
    - Protección insuficiente en la capa de transporte.

**GERENCIA DE SEGURIDAD DE INFORMACIÓN**

### 1.3. Enumeración
El objetivo de esta etapa es la obtención de los datos referente a los usuarios, nombres de equipos, base de datos, servicios de red, entre otros. A esta altura de la consultoría se realizan conexiones activas con el sistema y se ejecutan consultas dentro del mismo.

### 1.4. Explotación
En esta etapa finalmente se realiza el acceso al sistema. Esta tarea se logra a partir de la explotación de aquellas vulnerabilidades previamente identificadas o pruebas de funcionalidad que puedan comprometer el activo evaluado y afecten la confidencialidad, integridad o disponibilidad de la información. En esta etapa es importante identificar y compilar los diferentes exploit o scripts a utilizar para comprometer un sistema.

## 2. Plan de pruebas de aseguramiento:
Estas pruebas contemplan una revisión mediante herramientas automatizadas como Nexpose, donde se realiza un análisis de vulnerabilidades del servidor basadas en sistema operativo, software instalado, configuración, así como de los puertos y servicios identificados.

## 3. Tiempos
En términos generales el proceso de certificación contempla tres etapas:

### 3.1. Revisión de seguridad al aplicativo
**Duración web 10 +1 día hábil.** En esta actividad debemos ser capaces de detectar todas las vulnerabilidades antes de que los sistemas se expongan a Internet. Una vulnerabilidad en un sitio expuesto a Internet podría permitir que un hacker realice un ataque exitoso, lo cual afectaría nuestras Operaciones y la imagen de nuestra Organización de cara a la Comunidad.
Las pruebas que se realizan durante la revisión de seguridad son de tipo manual y automatizada. En esta etapa se realizaría una revisión del aplicativo, utilizando las mismas herramientas y técnicas que emplean los hackers. Esta etapa culmina con un informe que contiene todas vulnerabilidades y fallas que detectemos.

### 3.2. Corrección de vulnerabilidades
Lo realiza el proveedor o equipo de desarrollo. Normalmente la duración de este trabajo depende de la complejidad del aplicativo y de lo que detectemos, tiene como finalidad corregir lo detectado en el primer punto.

### 3.3. Recertificación de seguridad
Tiene una duración de 3 a 5 días y su objetivo es verificar que efectivamente los problemas que detectamos fueron corregidos.

## 4. Alcance
Este informe contempla pruebas de seguridad de tipo Caja Gris, a través de la cual se busca detectar las vulnerabilidades que presenta la aplicación para así presentar un plan de mitigación. Para esto se realizará una revisión automatizada y manual.

**(Nota: Las URLs de API originales han sido sanitizadas en el código fuente para protección del negocio)**

## 5. Clasificación de las vulnerabilidades
Las vulnerabilidades son clasificadas en una escala de cuatro (4) niveles de riesgo, tomado en cuenta que Riesgo = Probabilidad x Impacto: Bajo, Medio, Alto, Crítico.

### 5.1. Metodología Evaluación de riesgos (Matriz)
La metodología de evaluación de riesgos para las Empresas Falabella es la siguiente: NR = I x P Donde (NR es el Nivel de Riesgo (Calificación de Riesgo), I corresponde a Impacto, P es la Probabilidad. Los riesgos deben ser priorizados de acuerdo con la ubicación en la matriz de riesgos (mapa de calor), para su gestión posterior.

| Nivel | Descripción |
|---|---|
| Bajo (1) | La vulnerabilidad es una preocupación menor. Existen controles de seguridad relevantes, u otras soluciones que están completamente implementadas y son en gran medida efectivas. |
| Medio (2) | La vulnerabilidad es de preocupación moderada, basado en la exposición de la vulnerabilidad, la facilidad de explotación y / o en la gravedad de los impactos que podrían resultar de su explotación. |
| Alto (3) | La vulnerabilidad es de gran preocupación, basado en la exposición de la vulnerabilidad y la facilidad de explotación y / o en la gravedad de los impactos que podrían resultar de su explotación. |
| Crítico (4) | La vulnerabilidad está expuesta y es explotable, y su explotación podría resultar en impactos severos. No se han implementado ni planificado controles de seguridad pertinentes. |

### 5.2. Determinación de Probabilidad del Riesgo
Falabella gestiona la evaluación de los riesgos a partir de la siguiente propuesta de probabilidades (Remota, Posible u Ocasional, Probable, Casi cierta).

### 5.3. Mapa de Calor de Riesgo
Falabella tiene definido gestionar los riesgos de Seguridad de la Información en un mapa de calor que tiene dimensiones de 4 x 4 para una mejor valoración de los riesgos.

## 6. Postura de seguridad
Tomando en cuenta las vulnerabilidades detectadas durante el ejercicio, se tiene que la postura de seguridad de las APIs analizadas fue clasificada inicialmente como **Inseguro**.

| Crítico | Alto | Medio | Bajo | Postura de Seguridad |
|---|---|---|---|---|
| 1 | 4 | 5 | 1 | Inseguro |

## 7. Resumen de vulnerabilidades detectadas y mitigadas

- **C-001 Exposición de Información Técnica Sensible:** Se implementó autenticación de usuarios.
- **A-001 Ausencia de Login Federado (CAMP):** Se recomendó utilizar CAMP y MFA.
- **A-002 Enumeración de Usuarios:** Se ajustaron mensajes de error genéricos.
- **A-003 Password Spraying:** Implementación de bloqueos y rate limits.
- **A-004 Política de Contraseñas Débil:** Configuración de política de contraseñas fuertes.
- **M-001 Rate Limit muy Elevado:** Configuración de API Gateway o WAF.
- **M-002 Ausencia de WAF:** Se incluyeron controles estrictos.
- **M-003 Cabeceras Faltantes y Configuraciones Débiles:** Se configuraron cabeceras de seguridad (X-Content-Type-Options, HSTS, CORS restringido).
- **M-004 Inputs Reflejados:** Implementación de sanitización de inputs y outputs.
- **M-005 Insecure Direct Object Reference (IDOR):** Uso de UUIDs.
- **B-001 Exposición de Información Técnica:** Modificación de cabeceras y eliminación de stack traces.

## 8. Resultados y detalles

(Detalles completos de las vulnerabilidades C-001, A-001, A-002, A-003, A-004, M-001, M-002, M-003, M-004, M-005, B-001 se encuentran en el informe original adjunto y han sido abordados en este código).

## 9. Anexo

- **SQL Injection:** Se realizaron pruebas, mitigadas por análisis de DevSecOps.
- **Autenticación JWT:** Se corrigió la falla de verificación de expiración de tokens.
- **Protocolo HTTP:** Se estandarizó el uso de verbos HTTP.
- **Exposición en servidor de producción:** Se recomendó desactivar server-status en Apache.
