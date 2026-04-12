"""
Tests para utilidades y helpers.
"""

import pytest

import sys
sys.path.insert(0, "backend")

from utils.files import obtener_extension, validar_extension_archivo
from api.routes.upload import sanitizar_nombre_archivo


class TestObtenerExtension:
    """Tests para la función obtener_extension."""

    def test_extension_pdf(self):
        assert obtener_extension("documento.pdf") == "pdf"

    def test_extension_docx(self):
        assert obtener_extension("archivo.docx") == "docx"

    def test_extension_mayusculas(self):
        assert obtener_extension("DOCUMENTO.PDF") == "pdf"
        assert obtener_extension("Archivo.DOCX") == "docx"

    def test_extension_multiple_puntos(self):
        assert obtener_extension("mi.documento.pdf") == "pdf"
        assert obtener_extension("archivo.v2.docx") == "docx"

    def test_sin_extension(self):
        assert obtener_extension("sin-extension") == ""
        assert obtener_extension("") == ""

    def test_solo_punto(self):
        assert obtener_extension(".") == ""


class TestValidarExtension:
    """Tests para validación de extensiones."""

    def test_pdf_valido(self):
        assert validar_extension_archivo("archivo.pdf") is True

    def test_docx_valido(self):
        assert validar_extension_archivo("documento.docx") is True

    def test_exe_invalido(self):
        assert validar_extension_archivo("virus.exe") is False

    def test_txt_invalido(self):
        assert validar_extension_archivo("nota.txt") is False

    def test_sin_extension_invalido(self):
        assert validar_extension_archivo("archivo") is False


class TestSanitizarNombreArchivo:
    """Tests para sanitización de nombres de archivo."""

    def test_nombre_normal(self):
        assert sanitizar_nombre_archivo("documento.pdf", "pdf") == "documento.pdf"

    def test_nombre_con_espacios(self):
        assert sanitizar_nombre_archivo("mi documento.pdf", "pdf") == "mi documento.pdf"

    def test_nombre_con_path_traversal(self):
        result = sanitizar_nombre_archivo("../../../etc/passwd.pdf", "pdf")
        assert ".." not in result
        assert result.endswith(".pdf")

    def test_nombre_con_caracteres_especiales(self):
        result = sanitizar_nombre_archivo("file<script>.pdf", "pdf")
        assert "<" not in result
        assert ">" not in result

    def test_nombre_vacio_genera_uuid(self):
        result = sanitizar_nombre_archivo("", "pdf")
        assert result.endswith(".pdf")
        assert "document_" in result

    def test_solo_puntos(self):
        result = sanitizar_nombre_archivo("...", "pdf")
        assert result.endswith(".pdf")
        assert result.startswith("document_")
