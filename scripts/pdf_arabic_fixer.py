#!/usr/bin/env python3
"""
Arabic PDF Text Extractor and Restorer.

This module provides a production-ready, highly robust, and PEP8-compliant utility
to extract text from PDF files containing Arabic content and resolve issues with
disconnected, reversed (LTR instead of RTL), and fragmented characters.

It integrates `pypdf` for text extraction, `arabic-reshaper` for layout-aware
letter shaping, and `python-bidi` for the Unicode Bidirectional Algorithm.
This ensures mixed texts (English/Arabic/Numbers) are displayed in correct visual direction.

Requirements:
    pip install pypdf arabic-reshaper python-bidi
"""

import logging
import os
from typing import Dict, Any, Optional

# Configure logging for production diagnostics
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ArabicPDFProcessor")


class ArabicPDFProcessorError(Exception):
    """Base exception class for Arabic PDF processing errors."""
    pass


class FileAccessError(ArabicPDFProcessorError):
    """Raised when the target input PDF or output text file cannot be accessed."""
    pass


class TextProcessingError(ArabicPDFProcessorError):
    """Raised when error occurs during text extraction or reshaping processes."""
    pass


class ArabicPDFProcessor:
    """
    A professional processor to read and rectify Arabic text extracted from PDFs.
    
    Handles character reshaping (connecting letters based on context) and bidirectional
    reordering (reversing Arabic to RTL while keeping English/numbers LTR).
    """

    def __init__(self, reshape_config: Optional[Dict[str, Any]] = None) -> None:
        """
        Initializes the Arabic PDF Processor tool.

        Args:
            reshape_config: Optional custom settings dictionary for arabic-reshaper.
                            If None, standard reshaper configuration will be applied.
        """
        try:
            import arabic_reshaper
            from bidi.algorithm import get_display
        except ImportError as err:
            logger.critical(
                "Required libraries are missing. Please install dependencies: "
                "pip install arabic-reshaper python-bidi pypdf"
            )
            raise ImportError(
                "Missing 'arabic-reshaper' or 'python-bidi'. Check requirements."
            ) from err

        # Default configuration for the reshaper to support all standard Arabic ligaments
        default_config = {
            'delete_harakat': False,          # Retain diacritics (harakat/short vowels)
            'support_ligatures': True,        # Enable ligatures like Lam-Alef
            'reorder_uzbek_el_to_le': False  # Irrelevant for Arabic, keep disabled
        }
        
        if reshape_config:
            default_config.update(reshape_config)

        # Initialize the stateful reshaper configuration
        self._reshaper_config = arabic_reshaper.config.ArabicReshaperConfig(
            **default_config
        )
        self._reshaper = arabic_reshaper.ArabicReshaper(
            configuration=self._reshaper_config
        )
        logger.info("ArabicPDFProcessor initialized successfully.")

    def fix_arabic_text(self, text: str) -> str:
        """
        Processes raw Arabic text to shape letters and apply Bidirectional ordering.

        Corrects disconnected Arabic characters by translating them to their contextual
        joining forms (Initial, Medial, Final, or Isolated) and then reorders RTL lines 
        correctly while keeping embedded English words or numbers oriented LTR.

        Args:
            text: The raw, distorted, or newly extracted text from a PDF.

        Returns:
            The corrected, visually natural text.
        """
        if not text or not text.strip():
            return ""

        try:
            from bidi.algorithm import get_display

            # 1. Reshape the Arabic characters so they can join together correctly
            reshaped_text = self._reshaper.reshape(text)

            # 2. Apply the BiDi (Bidirectional) algorithm to handle mixed RTL/LTR tokens
            corrected_text: str = get_display(reshaped_text)
            return corrected_text

        except Exception as err:
            logger.error("Failed to shape and reorder Arabic text: %s", err)
            raise TextProcessingError("Error during text reshaping and bidi processing.") from err

    def extract_raw_text(self, pdf_path: str) -> str:
        """
        Extracts raw, native plain text page-by-page from a digital PDF file.

        Args:
            pdf_path: Absolute or relative file path to the PDF document.

        Returns:
            The raw text string extracted from the document.
        
        Raises:
            FileAccessError: If the PDF file is missing, corrupted, or inaccessible.
            TextProcessingError: If extraction fails during read operations.
        """
        if not os.path.exists(pdf_path):
            logger.error("Target PDF file not found at path: %s", pdf_path)
            raise FileAccessError(f"No file found at: {pdf_path}")

        try:
            from pypdf import PdfReader
        except ImportError as err:
            raise ImportError("The 'pypdf' library is required to extract text from PDFs.") from err

        try:
            logger.info("Attempting to load and read PDF: %s", pdf_path)
            reader = PdfReader(pdf_path)
            raw_text_parts = []

            for index, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    raw_text_parts.append(page_text)
                else:
                    logger.warning("Page %d yielded empty text. (Might be an image scan).", index + 1)

            full_raw_text = "\n\n--- PAGE --- \n\n".join(raw_text_parts)
            return full_raw_text

        except Exception as err:
            logger.error("Failed to read the PDF file at %s: %s", pdf_path, err)
            raise TextProcessingError(f"Failed to extract text from PDF: {err}") from err

    def process_pdf(self, pdf_path: str) -> str:
        """
        Loads a PDF, extracts raw text, and fully stabilizes all Arabic layout issues.

        Args:
            pdf_path: File path to the source PDF document.

        Returns:
            The final, pristine reordered and shaped multi-line text string.
        """
        raw_text = self.extract_raw_text(pdf_path)
        if not raw_text.strip():
            logger.warning("Extracted text is empty. PDF might be scanned/image-only.")
            return ""

        return self.fix_arabic_text(raw_text)

    def save_to_file(self, text: str, output_path: str, encoding: str = "utf-8") -> None:
        """
        Saves the processed Unicode text safely into a text file.

        Args:
            text: The shaped and ordered text to save.
            output_path: Target destination path for the output file.
            encoding: Text encoder default, typically 'utf-8'.
        
        Raises:
            FileAccessError: If the folder structure is invalid or file cannot be written.
        """
        try:
            directory = os.path.dirname(output_path)
            if directory and not os.path.exists(directory):
                os.makedirs(directory, exist_ok=True)

            logger.info("Saving corrected text to: %s", output_path)
            with open(output_path, "w", encoding=encoding) as file_handler:
                file_handler.write(text)

        except Exception as err:
            logger.error("Failed to write output text to %s: %s", output_path, err)
            raise FileAccessError(f"Cannot save content to target path: {output_path}") from err


# =====================================================================
# PRACTICAL PRODUCTION USAGE EXAMPLE
# =====================================================================
if __name__ == "__main__":
    import tempfile

    print("--- Arabic PDF Text Repair Utility Demo ---")
    
    # 1. Synthesize a mock disconnected/reversed test payload to simulate extracted PDF text
    # Arabic letters are normally disconnected/reversed when read from raw binary PDF nodes
    # Let's mock a distorted segment: "ن س ج ت ب" (representing "تجربة") mixed with English numbers
    distorted_sample = "هـ ذ ه   ت ج ر ب ة   م ع   ا ل أ ر ق ا م   12345   و ك ل م ا ت   English   م ت د ا خ ل ة ."
    
    try:
        # 2. Instantiate the processor
        processor = ArabicPDFProcessor()
        
        # 3. Resolve the letter-joining and RTL orientation issues
        fixed_output = processor.fix_arabic_text(distorted_sample)
        
        print("\n[Input Distorted Text (Simulating raw PDF extraction)]:")
        print(distorted_sample)
        
        print("\n[Output Corrected/Shaped Text (Production ready)]:")
        print(fixed_output)

        # 4. Show code working with file reading/writing flow (simulate a local file process)
        with tempfile.TemporaryDirectory() as temp_dir:
            sample_output_path = os.path.join(temp_dir, "repaired_arabic_output.txt")
            
            # Save the processed text
            processor.save_to_file(fixed_output, sample_output_path)
            print(f"\n[Success] Safely exported corrected text in UTF-8 directly to: {sample_output_path}")
            
    except ImportError:
        print("\n[Info] To test run this demo locally with real dependencies, execute:")
        print("pip install pypdf arabic-reshaper python-bidi")
        print("\nThen run this script.")
    except ArabicPDFProcessorError as e:
        print(f"\n[Error] Processing encountered structural failure: {e}")
