# Arquitectura del Proyecto (Presentacion)

Este proyecto usa una arquitectura mixta donde:

- `PHP` maneja la logica del backend.
- `PHP Forms` recibe y procesa entradas del usuario.
- `JavaScript` controla la interaccion del frontend.
- `Python` se conecta de forma directa para ejecutar/emular codigo y validar si corre correctamente.
- La `IA` revisa el resultado final y tiene la ultima palabra para aprobar o rechazar.

## Diagrama Global (Blanco y Negro)

Imagen exportada: `docs/diagrama_global_bn.jpeg`

```mermaid
flowchart TD
    U[Usuario] --> F[PHP Forms]
    F --> P[PHP Backend]
    P --> J[JavaScript UI]
    P --> Y[Python Runner/Emulador]
    Y --> R[Resultado de ejecucion]
    R --> A[IA Evaluadora]
    A --> D{Decision final}
    D -->|Aprobado| OK[Codigo valido]
    D -->|Rechazado| NO[Corregir y reenviar]
    NO --> F

    classDef bw fill:#ffffff,stroke:#000000,color:#000000,stroke-width:1px;
    classDef bwd fill:#ffffff,stroke:#000000,color:#000000,stroke-width:2px;
    class U,F,P,J,Y,R,A,OK,NO bw;
    class D bwd;
```

## Flujo General

1. Usuario envia datos desde un formulario.
2. PHP procesa la solicitud.
3. JavaScript actualiza la interfaz.
4. Python ejecuta o emula el codigo.
5. IA evalua el resultado y decide.

## Objetivo

Tener una plataforma simple para ejecutar codigo, validarlo automaticamente y cerrar el proceso con una revision inteligente por IA.
