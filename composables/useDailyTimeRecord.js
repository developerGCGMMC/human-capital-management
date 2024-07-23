import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export default function useDailyTimeRecord() {
    // ! A4: 210 x 297 (x, y)
    const generateDailyTimeRecordPDF = async (daily_time_record) => {
        // console.log('generateDailyTimeRecord');
        // console.log('daily_time_record.pdfBody: '+JSON.stringify(daily_time_record.pdfBody));

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
        // console.log('pageHeight: '+pageHeight+' | pageWidth: '+pageWidth);

        const margins = {
            top: 10,
            bottom: 10,
            left: 10,
            right: 10
        };

        const pageNumber = doc.internal.getNumberOfPages();
        // console.log('pageNumber: '+pageNumber);
    
        // const startingPage = doc.internal.getCurrentPageInfo().pageNumber;
        // console.log('startingPage: '+startingPage);
        // console.log('doc.internal.getCurrentPageInfo(): '+JSON.stringify(doc.internal.getCurrentPageInfo()));

        const lineWidth = 0.4;

        const header = [
            [
                {
                    content: 'Civil Service Form No. 48',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 2
                        },
                        lineWidth: {
                            top: lineWidth,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 5,
                        fontStyle: 'italic'
                    }
                },
            ],
            [
                {
                    content: 'DAILY TIME RECORD',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 4,
                            right: 1,
                            bottom: 4,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 11,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: daily_time_record.employeeDetail.fullName,
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 0,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 8,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: '(Name)',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 4,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'italic'
                    }
                }
            ],
            [
                {
                    content: 'For the month of '+daily_time_record.file.header.month,
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 0,
                            left: 8
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'normal'
                    }
                }
            ],
            [
                {
                    content: 'Official hours for arrival and departure',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 0,
                            left: 8
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'normal'
                    }
                }
            ],
            [
                {
                    content: 'Regular days: ',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 0,
                            left: 12
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'normal'
                    }
                }
            ],
            [
                {
                    content: 'Saturdays: ',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 1,
                            left: 12
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: lineWidth,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'normal'
                    }
                }
            ],

            [
                {
                    content: 'Day',
                    rowSpan: 2,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'A.M.',
                    colSpan: 2,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: lineWidth,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'P.M.',
                    colSpan: 2,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: lineWidth,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'UNDERTIME',
                    colSpan: 2,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: lineWidth,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: 'Arrival',
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'Departure',
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'Arrival',
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'Departure',
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'Hours',
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                },
                {
                    content: 'Minutes',
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: 0
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                }
            ]
        ];
        const footer = [
            [
                {
                    content: 'TOTAL',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 1,
                            right: 1,
                            bottom: 1,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: lineWidth,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: 'I CERTIFY on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 2,
                            right: 6,
                            bottom: 0,
                            left: 6
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: '_________________________________',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 4,
                            right: 1,
                            bottom: 0,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 8,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: 'Signature',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 3,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'italic'
                    }
                }
            ],
            [
                {
                    content: 'VERIFIED as to the prescribed office hours:',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 0,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: daily_time_record.file.footer.service_signatory.signatoryName,
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 6,
                            right: 1,
                            bottom: 0,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: 0,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 8,
                        fontStyle: 'bold'
                    }
                }
            ],
            [
                {
                    content: 'In-charge',
                    colSpan: 7,
                    styles: {
                        valign: 'middle',
                        halign: 'center',
                        cellPadding: {
                            top: 0,
                            right: 1,
                            bottom: 4,
                            left: 1
                        },
                        lineWidth: {
                            top: 0,
                            right: lineWidth,
                            bottom: lineWidth,
                            left: lineWidth
                        },
                        lineColor: 0,
                        fontSize: 6,
                        fontStyle: 'italic'
                    }
                }
            ]
        ];

        doc.autoTable({
            head: header,
            foot: footer,
            body: daily_time_record.pdfBody,

            theme: 'grid',
            showHead: 'firstPage',
            startY: margins.top,
            margin: {
                left: margins.left,
                right: (pageWidth / 2) + 1,
            },

            styles: {
                textColor: 0,
            },
            headStyles: {
                fillColor: false
            },
            footStyles: {
                fillColor: false
            },
            bodyStyles: {
                valign: 'middle',
                halign: 'center',
                cellPadding: {
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1
                },
                lineWidth: {
                    top: lineWidth,
                    right: lineWidth,
                    bottom: lineWidth,
                    left: lineWidth
                },
                lineColor: 0,
                fontSize: 6
            },
        });
        doc.setPage(pageNumber);
        doc.autoTable({
            head: header,
            foot: footer,
            body: daily_time_record.pdfBody,

            theme: 'grid',
            showHead: 'firstPage',
            startY: margins.top,
            margin: {
                left: (pageWidth / 2) + 1,
                right: margins.right
            },

            styles: {
                textColor: 0,
            },
            headStyles: {
                fillColor: false
            },
            footStyles: {
                fillColor: false
            },
            bodyStyles: {
                valign: 'middle',
                halign: 'center',
                cellPadding: {
                    top: 1,
                    right: 1,
                    bottom: 1,
                    left: 1
                },
                lineWidth: {
                    top: lineWidth,
                    right: lineWidth,
                    bottom: lineWidth,
                    left: lineWidth
                },
                lineColor: 0,
                fontSize: 6
            },
        });

        // doc.autoPrint({variant: 'non-conform'});
        doc.save(daily_time_record.file.name+'.pdf');

        return false;
    }

    return {
        generateDailyTimeRecordPDF
    }
}