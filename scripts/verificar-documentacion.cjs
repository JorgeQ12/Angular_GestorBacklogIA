const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const RAIZ = path.resolve(__dirname, '..');
const DIRECTORIO_APLICACION = path.join(RAIZ, 'src', 'app');

/** Reúne recursivamente los archivos TypeScript productivos de la aplicación. */
function listarArchivos(directorio) {
  return fs.readdirSync(directorio, { withFileTypes: true }).flatMap((entrada) => {
    const ubicacion = path.join(directorio, entrada.name);
    if (entrada.isDirectory()) return listarArchivos(ubicacion);
    return entrada.name.endsWith('.ts') && !entrada.name.endsWith('.spec.ts') ? [ubicacion] : [];
  });
}

/** Indica si la declaración tiene un bloque JSDoc inmediatamente asociado. */
function tieneJsdoc(fuente, nodo) {
  return (ts.getLeadingCommentRanges(fuente.text, nodo.pos) || []).some((rango) =>
    fuente.text.slice(rango.pos, rango.end).startsWith('/**'),
  );
}

/** Obtiene un nombre legible para presentar una declaración sin documentación. */
function obtenerNombre(nodo, fuente) {
  if (nodo.name) return nodo.name.getText(fuente);
  if (ts.isVariableStatement(nodo)) {
    return nodo.declarationList.declarations
      .map((declaracion) => declaracion.name.getText(fuente))
      .join(', ');
  }
  return ts.SyntaxKind[nodo.kind];
}

/** Indica si una declaración de nivel superior forma parte del contrato exportado. */
function estaExportado(nodo) {
  return Boolean(
    ts.getCombinedModifierFlags(nodo) & ts.ModifierFlags.Export ||
      nodo.modifiers?.some((modificador) => modificador.kind === ts.SyntaxKind.DefaultKeyword),
  );
}

const errores = [];
let declaracionesExportadas = 0;
let propiedades = 0;
let operaciones = 0;

for (const archivo of listarArchivos(DIRECTORIO_APLICACION)) {
  const contenido = fs.readFileSync(archivo, 'utf8');
  const fuente = ts.createSourceFile(archivo, contenido, ts.ScriptTarget.Latest, true);

  /** Registra la ubicación exacta de una declaración que incumple la convención. */
  function registrar(nodo, categoria) {
    const posicion = fuente.getLineAndCharacterOfPosition(nodo.getStart(fuente));
    errores.push(
      `${path.relative(RAIZ, archivo)}:${posicion.line + 1} [${categoria}] ${obtenerNombre(nodo, fuente)}`,
    );
  }

  for (const declaracion of fuente.statements) {
    const auditable =
      ts.isClassDeclaration(declaracion) ||
      ts.isInterfaceDeclaration(declaracion) ||
      ts.isTypeAliasDeclaration(declaracion) ||
      ts.isEnumDeclaration(declaracion) ||
      ts.isFunctionDeclaration(declaracion) ||
      ts.isVariableStatement(declaracion);
    if (auditable && estaExportado(declaracion)) {
      declaracionesExportadas += 1;
      if (!tieneJsdoc(fuente, declaracion)) registrar(declaracion, 'exportación');
    }
  }

  /** Recorre las clases y valida todos sus miembros declarados, sin importar visibilidad. */
  function visitar(nodo) {
    if (ts.isClassDeclaration(nodo)) {
      for (const miembro of nodo.members) {
        if (ts.isConstructorDeclaration(miembro)) continue;
        if (ts.isPropertyDeclaration(miembro)) {
          propiedades += 1;
          if (!tieneJsdoc(fuente, miembro)) registrar(miembro, 'propiedad');
          continue;
        }
        if (
          ts.isMethodDeclaration(miembro) ||
          ts.isGetAccessorDeclaration(miembro) ||
          ts.isSetAccessorDeclaration(miembro)
        ) {
          operaciones += 1;
          if (!tieneJsdoc(fuente, miembro)) registrar(miembro, 'operación');
        }
      }
    }
    ts.forEachChild(nodo, visitar);
  }

  visitar(fuente);
}

if (errores.length) {
  console.error(`Documentación incompleta: ${errores.length} declaración(es) sin JSDoc.`);
  console.error(errores.join('\n'));
  process.exit(1);
}

console.log(
  `Documentación completa: ${declaracionesExportadas} exportaciones, ${propiedades} propiedades y ${operaciones} operaciones verificadas.`,
);
