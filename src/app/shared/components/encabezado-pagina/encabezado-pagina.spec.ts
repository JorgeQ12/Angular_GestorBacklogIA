import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EncabezadoPagina } from './encabezado-pagina';

@Component({
  imports: [EncabezadoPagina],
  template: `
    <app-encabezado-pagina
      titulo="Proyectos"
      etiqueta="Proyectos"
      descripcion="Consulta las iniciativas disponibles."
      contexto="Lunes, 24 de agosto"
      icono="inicio"
      idTitulo="titulo-proyectos"
    >
      <span encabezadoPaginaMetadatos class="ui-page-header__meta-item">
        <strong>12</strong> activos
      </span>
      <button encabezadoPaginaAcciones type="button">Crear proyecto</button>
    </app-encabezado-pagina>
  `,
})
class AnfitrionEncabezadoPagina {}

describe('EncabezadoPagina', () => {
  let fixture: ComponentFixture<AnfitrionEncabezadoPagina>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnfitrionEncabezadoPagina],
    }).compileComponents();
    fixture = TestBed.createComponent(AnfitrionEncabezadoPagina);
    fixture.detectChanges();
  });

  it('presenta la identidad y el contexto de la página', () => {
    const encabezado = fixture.nativeElement.querySelector('header') as HTMLElement;

    expect(encabezado.getAttribute('aria-labelledby')).toBe('titulo-proyectos');
    expect(encabezado.querySelector('h1')?.textContent).toContain('Proyectos');
    expect(encabezado.querySelector('.ui-page-header__eyebrow')?.textContent).toContain(
      'Proyectos',
    );
    expect(encabezado.querySelector('.ui-page-header__description')?.textContent).toContain(
      'Consulta las iniciativas disponibles.',
    );
    expect(encabezado.querySelector('.ui-page-header__context')?.textContent).toContain(
      'Lunes, 24 de agosto',
    );
  });

  it('proyecta los metadatos y las acciones proporcionadas por la página', () => {
    expect(fixture.nativeElement.querySelector('[encabezadoPaginaMetadatos]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[encabezadoPaginaAcciones]')).toBeTruthy();
  });
});
