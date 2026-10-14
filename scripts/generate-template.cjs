const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  convertInchesToTwip
} = require('docx');
const fs = require('fs');
const path = require('path');

function createCell(children, options = {}) {
  return new TableCell({
    children,
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    borders: options.borders || {
      top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }
    },
    shading: options.shading || undefined,
    margins: {
      top: convertInchesToTwip(0.08),
      bottom: convertInchesToTwip(0.08),
      left: convertInchesToTwip(0.12),
      right: convertInchesToTwip(0.12)
    }
  });
}

async function generateDocx() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 22 // 11pt (half-points)
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              after: 120
            }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
              right: convertInchesToTwip(1)
            }
          }
        },
        children: [
          // Header / Title Indonesian
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: "JUDUL ARTIKEL DALAM BAHASA INDONESIA, ISTILAH ASING ITALIC",
                font: "Times New Roman",
                size: 24, // 12pt
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 140 },
            children: [
              new TextRun({
                text: "(Judul: Huruf kapital, Times New Roman 12 pt, bold, singkat dan jelas, menggambarkan isi artikel, maksimal 10 kata, center (kata sambung tidak dihitung))",
                font: "Times New Roman",
                size: 20, // 10pt
                italics: true,
                color: "555555"
              })
            ]
          }),

          // English Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60, after: 200 },
            children: [
              new TextRun({
                text: "Article Title in English",
                font: "Times New Roman",
                size: 24, // 12pt
                bold: true,
                italics: true
              })
            ]
          }),

          // Authors
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
              new TextRun({
                text: "Nama Penulis SATU",
                font: "Times New Roman",
                size: 22, // 11pt
                bold: true
              }),
              new TextRun({
                text: "1*",
                font: "Times New Roman",
                size: 18,
                superScript: true,
                bold: true
              }),
              new TextRun({
                text: ",  Nama Penulis DUA",
                font: "Times New Roman",
                size: 22,
                bold: true
              }),
              new TextRun({
                text: "2",
                font: "Times New Roman",
                size: 18,
                superScript: true,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 140 },
            children: [
              new TextRun({
                text: "(Nama Penulis: Huruf kapital setiap awal huruf dalam kata, semua kapital pada akhir nama, Times New Roman 11 pt, bold, center)",
                font: "Times New Roman",
                size: 18, // 9pt
                italics: true,
                color: "555555"
              })
            ]
          }),

          // Affiliations
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "1 ", superScript: true }),
              new TextRun({
                text: "Nama fakultas/prodi, Nama Perguruan Tinggi/Afiliasi, Alamat Lengkap Perguruan Tinggi/Afiliasi (terdiri dari jalan, nomor, kecamatan, kota/kabupaten, kode pos, negara)",
                font: "Times New Roman",
                size: 20 // 10pt
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 80 },
            children: [
              new TextRun({ text: "2 ", superScript: true }),
              new TextRun({
                text: "Nama fakultas/prodi, Nama Perguruan Tinggi/Afiliasi, Alamat Lengkap Perguruan Tinggi/Afiliasi (terdiri dari jalan, nomor, kecamatan, kota/kabupaten, kode pos, negara)",
                font: "Times New Roman",
                size: 20 // 10pt
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 100 },
            children: [
              new TextRun({
                text: "Catatan: jika seluruh penulis berasal dari satu afiliasi yang sama tidak perlu diberi pangkat 1, 2, 3 dst.",
                font: "Times New Roman",
                size: 18,
                italics: true,
                color: "555555"
              })
            ]
          }),

          // Contact details
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: "*Email korespondensi: email@institusi.ac.id",
                font: "Times New Roman",
                size: 20, // 10pt
                bold: true
              }),
              new TextRun({
                text: " (Times New Roman, 10 pt, center)",
                font: "Times New Roman",
                size: 18,
                italics: true,
                color: "555555"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: "No HP (WhatsApp) : 08xx xxxx xxxx ",
                font: "Times New Roman",
                size: 20
              }),
              new TextRun({
                text: "(untuk kebutuhan korespondensi, No HP tidak akan ditampilkan jika terbit)",
                font: "Times New Roman",
                size: 18,
                italics: true,
                color: "555555"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({
                text: "ORCID : https://orcid.org/0000-0000-0000-0000 ",
                font: "Times New Roman",
                size: 20
              }),
              new TextRun({
                text: "(setiap penulis, jika ada)",
                font: "Times New Roman",
                size: 18,
                italics: true,
                color: "555555"
              })
            ]
          }),

          // Article Info & Abstract Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell([
                    new Paragraph({
                      spacing: { before: 0, after: 60 },
                      children: [new TextRun({ text: "Article Info", bold: true, size: 22 })]
                    }),
                    new Paragraph({
                      spacing: { before: 60, after: 40 },
                      children: [
                        new TextRun({ text: "Article History:", bold: true, size: 19 }),
                        new TextRun({ text: "\nSubmission : dd-mm-yyyy\nAccepted : dd-mm-yyyy\nOnline Publication : dd-mm-yyyy", size: 19 }),
                        new TextRun({ text: "\n(Bagian ini ditulis pengelola jurnal)", size: 17, italics: true, color: "666666" })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 80, after: 40 },
                      children: [
                        new TextRun({ text: "Keywords:\n", bold: true, size: 19 }),
                        new TextRun({ text: "Tulis kata kunci dalam bahasa Inggris, 3-5 kata kunci", size: 19, italics: true })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 80, after: 40 },
                      children: [
                        new TextRun({ text: "Citation:\n", bold: true, size: 19 }),
                        new TextRun({ text: "(Bagian ini ditulis pengelola jurnal)", size: 17, italics: true, color: "666666" })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 60, after: 40 },
                      children: [
                        new TextRun({ text: "DOI:\n", bold: true, size: 19 }),
                        new TextRun({ text: "(Bagian ini ditulis pengelola jurnal)", size: 17, italics: true, color: "666666" })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 60, after: 0 },
                      children: [
                        new TextRun({ text: "URL:\n", bold: true, size: 19 }),
                        new TextRun({ text: "(Bagian ini ditulis pengelola jurnal)", size: 17, italics: true, color: "666666" })
                      ]
                    })
                  ], { width: 35 }),

                  createCell([
                    new Paragraph({
                      spacing: { before: 0, after: 80 },
                      children: [new TextRun({ text: "Abstract", bold: true, size: 22 })]
                    }),
                    new Paragraph({
                      spacing: { before: 0, after: 80 },
                      children: [
                        new TextRun({
                          text: "(Times New Roman, 11 pt, 1 spasi) Abstrak ditulis dalam bahasa Inggris, sekitar 200 kata, dalam satu paragraf tanpa sitasi. Abstrak memuat tujuan penelitian, metode, hasil utama, kesimpulan, dan kebaruan (originalitas) penelitian secara informatif dan jelas.",
                          size: 22,
                          italics: true
                        })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 80, after: 0 },
                      children: [
                        new TextRun({
                          text: "This study investigates the impact of digital audit tools and tax compliance mechanisms on firm value in emerging markets. Using an empirical quantitative approach, data were gathered from 150 publicly listed firms over the period 2021-2025. Multiple regression analysis was employed to test the formulated hypotheses. The results indicate that modern continuous auditing significantly improves financial statement quality, whereas core tax system compliance mediates corporate transparency. These findings provide substantial implications for regulators and academic practitioners seeking enhanced governance frameworks.",
                          size: 22
                        })
                      ]
                    })
                  ], { width: 65 })
                ]
              })
            ]
          }),

          // Section 1
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 100 },
            children: [new TextRun({ text: "1. PENDAHULUAN", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Paragraf 1: latar belakang dan fenomena. Jelaskan konteks penelitian di bidang audit, akuntansi, atau perpajakan secara ringkas, didukung data atau fakta terbaru dan sitasi dari jurnal ilmiah. Contoh sitasi dalam teks: (Nama Belakang, 2023); Nama Belakang dan Rekan (2022); (Nama Belakang & Nama Belakang, 2021).)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Paragraf 2: kesenjangan penelitian (research gap). Uraikan hasil penelitian terdahulu yang belum konsisten, belum menjawab persoalan, atau belum menggunakan konteks yang sama. Tunjukkan dengan jelas bagian yang belum diteliti.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 160 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Paragraf 3: tujuan dan kontribusi. Nyatakan tujuan penelitian secara eksplisit, lalu jelaskan kontribusi teoretis dan praktisnya. Akhiri dengan gambaran singkat susunan artikel.)",
                italics: true
              })
            ]
          }),

          // Section 2
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "2. TINJAUAN PUSTAKA DAN PENGEMBANGAN HIPOTESIS", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "2.1 Landasan Teori", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Jelaskan teori utama yang menjadi dasar penelitian, misalnya teori keagenan, teori legitimasi, atau teori kepatuhan pajak. Sebutkan penggagas teori dan kaitannya dengan variabel penelitian. Bagian ini opsional untuk studi kualitatif.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "2.2 Penelitian Terdahulu", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Rangkum penelitian terdahulu yang paling relevan, disajikan secara tematik, bukan daftar satu per satu. Hindari menyalin kalimat dari sumber.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "2.3 Pengembangan Hipotesis", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Rumuskan hipotesis berdasarkan teori dan temuan terdahulu. Setiap hipotesis diberi nomor dan dicetak di paragraf tersendiri.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: "H1: ", bold: true }),
              new TextRun({ text: "(Variabel X1 berpengaruh positif terhadap variabel Y.)", italics: true })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({ text: "H2: ", bold: true }),
              new TextRun({ text: "(Variabel X2 berpengaruh negatif terhadap variabel Y.)", italics: true })
            ]
          }),

          // Section 3
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "3. METODE PENELITIAN", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "3.1 Desain Penelitian", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Jelaskan pendekatan penelitian (kuantitatif, kualitatif, atau campuran), jenis data, sumber data, dan periode pengamatan.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "3.2 Populasi dan Sampel", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Jelaskan populasi, teknik pengambilan sampel (misalnya purposive sampling), kriteria sampel, dan jumlah sampel akhir. Untuk studi kualitatif, jelaskan informan atau objek studi dan cara pemilihannya.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "3.3 Definisi dan Pengukuran Variabel", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Jelaskan definisi operasional setiap variabel beserta proksi atau indikator pengukurannya, lengkap dengan sumber rujukannya.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "3.4 Teknik Analisis Data", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Jelaskan alat analisis (misalnya regresi linier berganda) dan perangkat lunaknya. Persamaan ditulis di tengah dengan nomor di tepi kanan, dan setiap simbol dijelaskan setelah persamaan:)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 80, after: 80 },
            children: [
              new TextRun({
                text: "Y = α + β1X1 + β2X2 + ε          (1)",
                bold: true,
                size: 22
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({
                text: "(Keterangan: Y = variabel terikat; X1, X2 = variabel bebas; α = konstanta; β = koefisien regresi; ε = galat.)",
                italics: true
              })
            ]
          }),

          // Section 4
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "4. HASIL DAN PEMBAHASAN", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "4.1 Hasil Penelitian", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Sajikan hasil sesuai urutan tujuan penelitian. Setiap tabel dan gambar wajib dirujuk dalam teks, misalnya: Tabel 1 menyajikan statistik deskriptif. Jangan mengulang seluruh angka tabel dalam teks.)",
                italics: true
              })
            ]
          }),

          // Table 1
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [new TextRun({ text: "Tabel 1. Statistik Deskriptif", bold: true, size: 22 })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "Variabel", bold: true })] })], { width: 35 }),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Rata-rata", bold: true })] })], { width: 22 }),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Std. Deviasi", bold: true })] })], { width: 23 }),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "N", bold: true })] })], { width: 20 })
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "Variabel 1 (X1)" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,00" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,00" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "000" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "Variabel 2 (X2)" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,00" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,00" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "000" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "Variabel terikat (Y)" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,00" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,00" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "000" })] })])
                ]
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [new TextRun({ text: "Sumber: Data diolah penulis (Tahun).", size: 18, italics: true })]
          }),

          // Table 2
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              new TextRun({ text: "(Hasil pengujian hipotesis disajikan pada Tabel 2, kemudian dijelaskan secara naratif.)\n", italics: true }),
              new TextRun({ text: "Tabel 2. Hasil Pengujian Hipotesis", bold: true, size: 22 })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "Variabel", bold: true })] })], { width: 35 }),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Koefisien", bold: true })] })], { width: 22 }),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "t-hitung", bold: true })] })], { width: 23 }),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sig.", bold: true })] })], { width: 20 })
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "Konstanta" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "X1" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "X2" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })]),
                  createCell([new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0,000" })] })])
                ]
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 140 },
            children: [
              new TextRun({
                text: "Catatan: Variabel terikat adalah Y. Signifikansi pada tingkat 5%. Sumber: Data diolah penulis (Tahun).",
                size: 18,
                italics: true
              })
            ]
          }),

          // Gambar 1
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({ text: "[ Sisipkan gambar di sini, rata tengah ]", size: 20, italics: true, color: "666666" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({ text: "Gambar 1. Judul Gambar ", bold: true, size: 20 }),
              new TextRun({ text: "(gambar minimal 300 dpi, huruf terbaca jelas)", size: 18, italics: true })
            ]
          }),

          // 4.2 Pembahasan
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [new TextRun({ text: "4.2 Pembahasan", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: "4.2.1 Pengaruh X1 terhadap Y", bold: true, size: 21 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Interpretasikan hasil pengujian H1, bandingkan dengan teori dan penelitian terdahulu, lalu jelaskan penyebab temuan sesuai atau berbeda dari dugaan.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [new TextRun({ text: "4.2.2 Pengaruh X2 terhadap Y", bold: true, size: 21 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 160 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Lakukan hal yang sama untuk H2. Pembahasan harus menjawab pertanyaan \"mengapa\", bukan hanya mengulang hasil.)",
                italics: true
              })
            ]
          }),

          // Section 5
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "5. KESIMPULAN", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 100 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Kesimpulan menjawab tujuan penelitian secara ringkas dan tidak mengulang abstrak.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [new TextRun({ text: "5.1 Implikasi", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Jelaskan implikasi teoretis dan praktis bagi regulator, praktisi audit dan akuntansi, atau otoritas pajak.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [new TextRun({ text: "5.2 Keterbatasan dan Saran", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 160 },
            alignment: AlignmentType.JUSTIFY,
            children: [
              new TextRun({
                text: "(Sebutkan keterbatasan penelitian dan saran konkret untuk penelitian selanjutnya.)",
                italics: true
              })
            ]
          }),

          // PERNYATAAN
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "PERNYATAAN", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: "Kontribusi penulis: ", bold: true }),
              new TextRun({ text: "(konseptualisasi, metodologi, analisis, penulisan: inisial penulis)", italics: true })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: "Pendanaan: ", bold: true }),
              new TextRun({ text: "(sumber dana atau \"Tidak ada pendanaan eksternal\")", italics: true })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: "Konflik kepentingan: ", bold: true }),
              new TextRun({ text: "(Penulis menyatakan tidak ada konflik kepentingan)", italics: true })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: "Ketersediaan data: ", bold: true }),
              new TextRun({ text: "(lokasi data atau alasan data tidak dibagikan)", italics: true })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({ text: "Penggunaan alat AI: ", bold: true }),
              new TextRun({ text: "(sebutkan alat dan tujuannya, atau \"Tidak ada\")", italics: true })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({ text: "Ucapan terima kasih: ", bold: true }),
              new TextRun({ text: "(opsional)", italics: true })
            ]
          }),

          // DAFTAR PUSTAKA
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "DAFTAR PUSTAKA", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: "(Urutkan abjad berdasarkan nama belakang penulis pertama, gaya APA 7, gunakan reference manager. Contoh berbagai jenis sumber:)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "Nama Belakang, A. B., & Nama Belakang, C. D. (Tahun). Judul artikel jurnal. Nama Jurnal, Volume(Nomor), halaman-halaman. https://doi.org/xxxxx"
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "Nama Belakang, A. B. (Tahun). Judul buku (Edisi ke-X). Penerbit."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "Nama Belakang, A. B. (Tahun). Judul bab. Dalam C. D. Editor (Ed.), Judul buku (hlm. xx-xx). Penerbit."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "Nama Belakang, A. B. (Tahun). Judul skripsi/tesis/disertasi [Skripsi/Tesis/Disertasi tidak dipublikasikan]. Nama Perguruan Tinggi."
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "Nama Belakang, A. B. (Tahun, Bulan Tanggal). Judul makalah. Nama Prosiding, halaman-halaman. https://doi.org/xxxxx"
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "Nama Lembaga. (Tahun). Judul laporan. Penerbit/URL"
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 60 },
            children: [
              new TextRun({
                text: "Republik Indonesia. (Tahun). Undang-Undang Nomor X Tahun YYYY tentang Judul. Lembaran Negara/URL"
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({
                text: "Nama Belakang, A. B. (Tahun, Bulan Tanggal). Judul halaman web. Nama Situs. https://alamat-situs"
              })
            ]
          }),

          // LAMPIRAN
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 100 },
            children: [new TextRun({ text: "LAMPIRAN", bold: true, size: 24 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: "(Opsional. Instrumen penelitian, daftar sampel, atau output pengolahan data yang terlalu panjang untuk badan artikel. Setiap lampiran diberi nomor dan judul, ditulis di halaman terpisah setelah daftar pustaka.)",
                italics: true
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [new TextRun({ text: "Lampiran 1. Daftar Sampel Penelitian", bold: true, size: 22 })]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "No.", bold: true })] })], { width: 10 }),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Kode", bold: true })] })], { width: 20 }),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Nama Perusahaan/Objek", bold: true })] })], { width: 50 }),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Tahun", bold: true })] })], { width: 20 })
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "1" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "AAAA" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Nama Perusahaan 1" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "2021-2025" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "2" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "BBBB" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Nama Perusahaan 2" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "2021-2025" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "3" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "CCCC" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Nama Perusahaan 3" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "2021-2025" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "4" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "DDDD" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Nama Perusahaan 4" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "2021-2025" })] })])
                ]
              }),
              new TableRow({
                children: [
                  createCell([new Paragraph({ children: [new TextRun({ text: "5" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "EEEE" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "Nama Perusahaan 5" })] })]),
                  createCell([new Paragraph({ children: [new TextRun({ text: "2021-2025" })] })])
                ]
              })
            ]
          }),
          new Paragraph({
            spacing: { before: 40, after: 120 },
            children: [new TextRun({ text: "Sumber: Data diolah penulis (Tahun).", size: 18, italics: true })]
          }),

          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [new TextRun({ text: "Lampiran 2. Instrumen Penelitian (Kuesioner/Pedoman Wawancara)", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: "(Cantumkan butir pertanyaan, skala pengukuran, dan sumber adopsi instrumen. Untuk wawancara, cantumkan pedoman pertanyaan tanpa identitas informan.)",
                italics: true
              })
            ]
          }),

          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [new TextRun({ text: "Lampiran 3. Output Pengolahan Data", bold: true, size: 22 })]
          }),
          new Paragraph({
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: "(Cantumkan tangkapan layar atau tabel output dari perangkat lunak statistik (misalnya SPSS, Stata, EViews, atau R) yang mendukung hasil pada badan artikel.)",
                italics: true
              })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, '..', 'public', 'template-jtaap.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Successfully generated template-jtaap.docx at:', outPath);
}

generateDocx().catch(err => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
