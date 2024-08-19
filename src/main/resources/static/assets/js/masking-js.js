// Sprinner Js
function showSpinner() {
  $("#spinnerTextElement").removeClass("d-none");
}
function hideSpinner() {
  $("#spinnerTextElement").addClass("d-none");
}

$("#ccPreviewModal").on("hidden.bs.modal", function () {
  // Code to execute when the modal is closed
  console.log("Modal closed");
  $("#ccPreviewCanvas").html("");
});

function ccPreview(id) {
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/rest/home/v1/cc-preview?id=" + id,
    beforeSend: function () {
      showSpinner();
    },
    complete: function () {
      //   $(".modal").hide();
    },
    dataType: "json",
    data: {},
    success: function (data) {
      var fileName = data.fileName;
      var ccPdf = base64ToBlob(data.fileBase64);
      renderCCIntoCanvas(fileName, ccPdf);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      hideSpinner();
      if (typeof jqXHR.responseJSON !== "undefined") {
        alert(jqXHR.responseJSON.message);
      } else {
        alert(
          "Network connection error. Please refresh page or try again later"
        );
      }
    },
  });
}

function base64ToBlob(base64String) {
  var contentType = "application/pdf";
  var byteCharacters = atob(base64String);
  var byteNumbers = new Array(byteCharacters.length);
  for (var i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  var byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

function renderCCIntoCanvas(fileName, blob) {
  if (blob) {
    showSpinner();
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const typedarray = new Uint8Array(e.target.result);
      const loadingTask = pdfjsLib.getDocument(typedarray);
      loadingTask.promise.then(function (pdf) {
        let totalPages = pdf.numPages;

        // Set filename
        $("#ccPreviewModalLabel").html(
          fileName + " (" + totalPages + " pages)"
        );
        let pageNum = 1; // Initialize pageNum
        function renderPage(pageNum) {
          pdf.getPage(pageNum).then(function (page) {
            // MASKED PDF SCALE
            const scale = 2;
            const viewport = page.getViewport({ scale: scale });

            const pdfContainer = document.getElementById("ccPreviewCanvas");

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.margin = "0 0 8px 0";

            const span = document.createElement("span");
            span.textContent = "Page no : " + pageNum;
            span.style.textAlign = "right";
            pdfContainer.appendChild(span);
            pdfContainer.appendChild(canvas);

            page
              .render({ canvasContext: context, viewport: viewport })
              .promise.then(function () {
                // Render next page if available
                if (pageNum < totalPages) {
                  renderPage(pageNum + 1);
                } else {
                  hideSpinner();
                  $("#ccPreviewModal").modal("show");
                  //Visible
                  // $('#uploadPreviewDiv').removeClass('d-none');
                }
              });
          });
        }
        renderPage(pageNum); // Start rendering the first page
      });
    };
    fileReader.readAsArrayBuffer(blob);
  }
}

// function uploadPdfPreview(file) {
//   if (file) {
//     showSpinner();

//     const fileReader = new FileReader();
//     fileReader.onload = function (e) {
//       const typedarray = new Uint8Array(e.target.result);
//       const loadingTask = pdfjsLib.getDocument(typedarray);
//       loadingTask.promise.then(function (pdf) {
//         let totalPages = pdf.numPages;
//         //Set page.no.
//         $("#txtTotalPages").html(totalPages);

//         let pageNum = 1; // Initialize pageNum
//         function renderPage(pageNum) {
//           pdf.getPage(pageNum).then(function (page) {
//             const scale = 2;
//             const viewport = page.getViewport({ scale: scale });

//             const pdfContainer = document.getElementById("uploadPdfPreview");
//             pdfContainer.style.visibility = "visible";

//             const canvas = document.createElement("canvas");
//             const context = canvas.getContext("2d");
//             canvas.height = viewport.height;
//             canvas.width = viewport.width;
//             canvas.style.margin = "0 0 8px 0";

//             pdfContainer.appendChild(canvas);

//             page
//               .render({ canvasContext: context, viewport: viewport })
//               .promise.then(function () {
//                 // Render next page if available
//                 if (pageNum < totalPages) {
//                   renderPage(pageNum + 1);
//                 } else {
//                   hideSpinner();
//                   //Visible
//                   $("#uploadPreviewDiv").removeClass("d-none");
//                   //Enable Mask Button
//                   $("#maskPdf").removeClass("d-none");

//                   // Scroll to Top
//                   $("#uploadPdfPreview").scrollTop(0);
//                 }
//               });
//           });
//         }
//         renderPage(pageNum); // Start rendering the first page
//       });
//     };
//     fileReader.readAsArrayBuffer(file);
//   }
// }
// -------------- MASKED PREV --------------------
var ccPdf;

function maskSingleCC(id) {
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/rest/home/v1/single-mask-test?id=" + id,
    beforeSend: function () {
      showSpinner();
    },
    complete: function () {
      // hideSpinner();
    },
    dataType: "json",
    data: {},
    success: function (data) {
      var fileName = data.fileName;
      var ccMaskedPdf = base64ToBlob(data.fileBase64);
      ccPdf = base64ToBlob(data.originalCCBase64);
      renderModalMaskedCC(fileName, ccPdf, ccMaskedPdf);
      // singleMaskedPdfPreview(fileName, ccMaskedPdf);
      // singleUnmaskedPdfPreview(fileName, ccPdf);
      //Enable edit option
      const url = window.URL.createObjectURL(ccMaskedPdf);
      initialRenderEditPdf(id, fileName, url);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      hideSpinner();
      if (typeof jqXHR.responseJSON !== "undefined") {
        alert(jqXHR.responseJSON.message);
      } else {
        alert(
          "Network connection error. Please refresh page or try again later"
        );
      }
    },
  });
}

function renderModalMaskedCC(fileName, ccPdf, ccMaskedPdf) {
  singleMaskedPdfPreview(fileName, ccMaskedPdf);
  singleUnmaskedPdfPreview(fileName, ccPdf);
}

$("#modalMaskedPdfPreview").on("hidden.bs.modal", function () {
  // Code to execute when the modal is closed
  $("#singleUnmaskedPdfCanvas").html("");
  $("#singleMaskedPdfCanvas").html("");
});

//Single Masked Pdf Preview
function singleMaskedPdfPreview(fileName, file) {
  //Clear Before
  $("#singleMaskedPdfCanvas").html("");

  // Set filename
  $("#txtFileNameMasked").html(fileName);
  if (file) {
    showSpinner();
    //Download Button
    var downloadLink = downloadPDF(fileName, file);
    $("#singleMaskedPreviewDownload").html(downloadLink);

    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const typedarray = new Uint8Array(e.target.result);
      const loadingTask = pdfjsLib.getDocument(typedarray);
      loadingTask.promise.then(function (pdf) {
        let totalPages = pdf.numPages;
        //Set Page No's
        $("#txtTotalPagesMasked").html(totalPages);

        let pageNum = 1; // Initialize pageNum
        function renderPage(pageNum) {
          pdf.getPage(pageNum).then(function (page) {
            // MASKED PDF SCALE
            // const scale = 0.29;
            // ORIGINAL PDF SCALE
            const scale = 2;
            const viewport = page.getViewport({ scale: scale });

            const pdfContainer = document.getElementById(
              "singleMaskedPdfCanvas"
            );

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.margin = "0 0 8px 0";

            const span = document.createElement("span");
            span.textContent = "Page no : " + pageNum;
            span.style.textAlign = "right";
            pdfContainer.appendChild(span);
            pdfContainer.appendChild(canvas);

            page
              .render({ canvasContext: context, viewport: viewport })
              .promise.then(function () {
                // Render next page if available
                if (pageNum < totalPages) {
                  renderPage(pageNum + 1);
                } else {
                  hideSpinner();
                  $("#modalMaskedPdfPreview").modal("show");
                }
              });
          });
        }
        renderPage(pageNum); // Start rendering the first page
      });
    };
    fileReader.readAsArrayBuffer(file);
  } else {
    alert("Not a file");
  }
}

//Single Unmasked Pdf Preview
function singleUnmaskedPdfPreview(fileName, file) {
  //Clear Before
  $("#singleUnmaskedPdfCanvas").html("");

  // Set filename
  $("#txtFileNameUnmasked").html(fileName);
  if (file) {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const typedarray = new Uint8Array(e.target.result);
      const loadingTask = pdfjsLib.getDocument(typedarray);
      loadingTask.promise.then(function (pdf) {
        let totalPages = pdf.numPages;
        //Set Page No's
        $("#txtTotalPagesUnmasked").html(totalPages);

        let pageNum = 1; // Initialize pageNum
        function renderPage(pageNum) {
          pdf.getPage(pageNum).then(function (page) {
            // MASKED PDF SCALE
            // const scale = 0.29;
            // ORIGINAL PDF SCALE
            const scale = 2;
            const viewport = page.getViewport({ scale: scale });

            const pdfContainer = document.getElementById(
              "singleUnmaskedPdfCanvas"
            );

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.margin = "0 0 8px 0";

            const span = document.createElement("span");
            span.textContent = "Page no : " + pageNum;
            span.style.textAlign = "right";
            pdfContainer.appendChild(span);
            pdfContainer.appendChild(canvas);

            page
              .render({ canvasContext: context, viewport: viewport })
              .promise.then(function () {
                // Render next page if available
                if (pageNum < totalPages) {
                  renderPage(pageNum + 1);
                } else {
                }
              });
          });
        }
        renderPage(pageNum); // Start rendering the first page
      });
    };
    fileReader.readAsArrayBuffer(file);
  }
}

$("#modalMaskedPdfPreview").on("shown.bs.modal", function () {
  $("#singleUnmaskedPdfCanvas").scrollTop(0);
  $("#singleMaskedPdfCanvas").scrollTop(0);
});

function downloadPDF(finalFileName, blob) {
  const url = window.URL.createObjectURL(blob);
  return (
    '<a href="' +
    url +
    '" download="' +
    finalFileName +
    '" target="_self" class="btn btn-sm btn-outline-success w-150px">Download Pdf</a>'
  );
}
// -------------------- Edit
//Nibhrit edit option variables
const { degrees, PDFDocument, rgb, StandardFonts, grayscale } = PDFLib;

var pdfMarker;

var pdfFileName;

function initialRenderEditPdf(id, fileName, url) {
  pdfMarker = new PDFMarker(url, "pdfContainer", "");

  //Edit tool Modal buttons
  var strBtn =
    '<button type="button" class="btn btn-danger me-2" onclick="resetEditPdfRender(\'' +
    id +
    "','" +
    fileName +
    "','" +
    url +
    "')\">Cancel Changes</button>" +
    '<button type="button" class="btn btn-success" onclick="applyEditPdfChangesAndPreview(\'' +
    id +
    "','" +
    fileName +
    "','" +
    url +
    "')\">Apply Changes</button>";
  $("#downloadEdit").html(strBtn);

  //Enable edit button
  var btnStr =
    '<button type="button" class="btn btn-sm btn-outline-primary px-5" data-bs-toggle="modal" data-bs-target="#modalEditMaskedPdf">Edit Pdf</button>';
  $("#editPdfButtonDiv").html(btnStr);
}

function resetEditPdfRender(id, fileName, url) {
  pdfMarker = new PDFMarker(url, "pdfContainer", "");

  var strBtn =
    '<button type="button" class="btn btn-danger me-2" onclick="resetEditPdfRender(\'' +
    id +
    "','" +
    fileName +
    "','" +
    url +
    "')\">Cancel Changes</button>" +
    '<button type="button" class="btn btn-success" onclick="applyEditPdfChangesAndPreview(\'' +
    id +
    "','" +
    fileName +
    "','" +
    url +
    "')\">Apply Changes</button>";
  $("#downloadEdit").html(strBtn);

  $("#modalEditMaskedPdf").modal("hide");
}

function applyEditPdfChangesAndPreview(id, fileName, url) {
  $.confirm({
    title: "Confirmation!",
    content: "Are you sure you want to proceed?",
    buttons: {
      confirm: function () {
        fetch(url)
          .then(function (res) {
            return res.arrayBuffer();
          })
          .then(function (existingPdfBytes) {
            PDFDocument.load(existingPdfBytes)
              .then(function (pdfDoc) {
                const pages = pdfDoc.getPages();
                const RBinfo = pdfMarker.getMaskData();

                for (let i = 0; i < RBinfo.length; i++) {
                  const pageno = RBinfo[i].PageNumber;
                  const pdfpage = pages[i];
                  const { width, height } = pdfpage.getSize();
                  const Hscale = (Number(RBinfo[i].PageWidth) / width).toFixed(
                    2
                  );
                  const Vscale = (
                    Number(RBinfo[i].PageHeight) / height
                  ).toFixed(2);

                  if (RBinfo[i].AAdharandPan != null) {
                    for (let j = 0; j < RBinfo[i].AAdharandPan.length; j++) {
                      // console.log("AAdharandPan : " + RBinfo[i].AAdharandPan[j]);
                      const H = Math.round(
                        (Number(RBinfo[i].AAdharandPan[j][3]) -
                          Number(RBinfo[i].AAdharandPan[j][1])) /
                          Vscale
                      );
                      pdfpage.drawRectangle({
                        x: Math.round(
                          Number(RBinfo[i].AAdharandPan[j][0]) / Hscale
                        ),
                        y:
                          Math.round(
                            height -
                              Number(RBinfo[i].AAdharandPan[j][1]) / Vscale
                          ) - H,
                        width: Math.round(
                          (Number(RBinfo[i].AAdharandPan[j][2]) -
                            Number(RBinfo[i].AAdharandPan[j][0])) /
                            Hscale
                        ),
                        height: H,
                        color: rgb(0, 0, 0),
                      });
                    }
                  }

                  if (RBinfo[i].fingerprints != null) {
                    for (let j = 0; j < RBinfo[i].fingerprints.length; j++) {
                      // console.log(RBinfo[i].fingerprints[j]);
                      const H = Math.round(
                        (Number(RBinfo[i].fingerprints[j][3]) -
                          Number(RBinfo[i].fingerprints[j][1])) /
                          Vscale
                      );
                      pdfpage.drawRectangle({
                        x: Math.round(
                          Number(RBinfo[i].fingerprints[j][0]) / Hscale
                        ),
                        y:
                          Math.round(
                            height -
                              Number(RBinfo[i].fingerprints[j][1]) / Vscale
                          ) - H,
                        width: Math.round(
                          (Number(RBinfo[i].fingerprints[j][2]) -
                            Number(RBinfo[i].fingerprints[j][0])) /
                            Hscale
                        ),
                        height: H,
                        color: rgb(0, 0, 0),
                      });
                    }
                  }

                  if (RBinfo[i].QRCodes != null) {
                    for (let j = 0; j < RBinfo[i].QRCodes.length; j++) {
                      // console.log("QRCode" + RBinfo[i].QRCodes[j]);
                      const H = Math.round(
                        (Number(RBinfo[i].QRCodes[j][3]) -
                          Number(RBinfo[i].QRCodes[j][1])) /
                          Vscale
                      );
                      pdfpage.drawRectangle({
                        x: Math.round(Number(RBinfo[i].QRCodes[j][0]) / Hscale),
                        y:
                          Math.round(
                            height - Number(RBinfo[i].QRCodes[j][1]) / Vscale
                          ) - H,
                        width: Math.round(
                          (Number(RBinfo[i].QRCodes[j][2]) -
                            Number(RBinfo[i].QRCodes[j][0])) /
                            Hscale
                        ),
                        height: H,
                        color: rgb(0, 0, 0),
                      });
                    }
                  }
                }

                //Changes appied
                pdfDoc
                  .save()
                  .then(function (pdfBytes) {
                    var blob = new Blob([pdfBytes], {
                      type: "application/pdf",
                    });
                    //Disable Edit tool Modal
                    $("#modalEditMaskedPdf").modal("hide");

                    //Save new Pdf file
                    saveEditedPdf(id, blob);
                    //Show final preview
                    renderModalMaskedCC(fileName, ccPdf, blob);
                    // singleMaskedPdfPreview(fileName, blob);
                    //Set final download button
                    var downloadLink = downloadPDF(fileName, blob);
                    $("#singleMaskedPreviewDownload").html(downloadLink);

                    //Set new Edit option for edit tool Modal
                    const url = window.URL.createObjectURL(blob);
                    //Reset
                    pdfMarker = new PDFMarker(url, "pdfContainer", "");

                    var strBtn =
                      '<button type="button" class="btn btn-danger me-2" onclick="resetEditPdfRender(\'' +
                      id +
                      "','" +
                      fileName +
                      "','" +
                      url +
                      "')\">Cancel Changes</button>" +
                      '<button type="button" class="btn btn-success" onclick="applyEditPdfChangesAndPreview(\'' +
                      id +
                      "','" +
                      fileName +
                      "','" +
                      url +
                      "')\">Apply Changes</button>";
                    $("#downloadEdit").html(strBtn);
                    // download(pdfBytes, "masked_DeedwithQr.pdf", "application/pdf");
                  })
                  .catch(function (error) {
                    console.log("Error saving PDF document:", error);
                  });
              })
              .catch(function (error) {
                console.log("Error loading PDF document:", error);
              });
          })
          .catch(function (error) {
            console.log("Error fetching PDF document:", error);
          });
      },
      cancel: function () {
        // Action for "No" button
        // alert("Cancelled!");
      },
    },
  });
}
// ---------- MASKED PREVIEW
function maskedCCPreview(id) {
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/rest/home/v1/masked-cc-preview?id=" + id,
    beforeSend: function () {
      showSpinner();
    },
    complete: function () {
      // hideSpinner();
    },
    dataType: "json",
    data: {},
    success: function (data) {
      var fileName = data.fileName;
      var ccMaskedPdf = base64ToBlob(data.fileBase64);
      ccPdf = base64ToBlob(data.originalCCBase64);
      renderModalMaskedCC(fileName, ccPdf, ccMaskedPdf);
      //Enable edit option
      const url = window.URL.createObjectURL(ccMaskedPdf);
      initialRenderEditPdf(id, fileName, url);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      hideSpinner();
      if (typeof jqXHR.responseJSON !== "undefined") {
        alert(jqXHR.responseJSON.message);
      } else {
        alert(
          "Network connection error. Please refresh page or try again later"
        );
      }
    },
  });
}
// ---------- MASKED Download
function maskedCCDownload(id) {
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/rest/home/v1/masked-cc-download?id=" + id,
    beforeSend: function () {
      showSpinner();
    },
    complete: function () {
      hideSpinner();
    },
    dataType: "json",
    data: {},
    success: function (data) {
      var fileName = data.fileName;
      var ccMaskedPdf = base64ToBlob(data.fileBase64);

      var a = document.createElement("a");
      a.href = URL.createObjectURL(ccMaskedPdf);
      a.setAttribute("download", fileName);
      a.click();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      hideSpinner();
      if (typeof jqXHR.responseJSON !== "undefined") {
        alert(jqXHR.responseJSON.message);
      } else {
        alert(
          "Network connection error. Please refresh page or try again later"
        );
      }
    },
  });
}

// function saveEditedPdf(id, blob) {
//   blobToBase64(blob)
//     .then((base64String) => {
//       var cutStr='data:application/pdf;base64,';

//       var jObj = { id: id, fileBase64: base64String };
//       let jsonStr = JSON.stringify(jObj);

//       $.ajax({
//         type: "POST",
//         url: "http://localhost:8080/rest/home/v1/save-edited-cc",
//         beforeSend: function () {
//           showSpinner();
//         },
//         complete: function () {
//           hideSpinner();
//         },
//         dataType: "json",
//         data: jsonStr,
//         contentType: "application/json; charset=utf-8",
//         async: false,
//         success: function (data) {
//           if (data.status === false) {
//             alert("Pdf not saved");
//           }
//         },
//         error: function (jqXHR, textStatus, errorThrown) {
//           hideSpinner();
//           if (typeof jqXHR.responseJSON !== "undefined") {
//             alert(jqXHR.responseJSON.message);
//           } else {
//             alert(
//               "Network connection error. Please refresh page or try again later"
//             );
//           }
//         },
//       });
//     })
//     .catch((error) => {
//       alert("Error:", error);
//     });
// }

function saveEditedPdf(id, blob) {
  async function convertBlobToBase64(blob) {
    try {
      const base64String = await blobToBase64(blob);
      var cutStr = "data:application/pdf;base64,";

      var jObj = { id: id, fileBase64: base64String.substr(cutStr.length) };
      let jsonStr = JSON.stringify(jObj);

      $.ajax({
        type: "POST",
        url: "http://localhost:8080/rest/home/v1/save-edited-cc",
        beforeSend: function () {
          showSpinner();
        },
        complete: function () {
          // hideSpinner();
        },
        dataType: "json",
        data: jsonStr,
        contentType: "application/json; charset=utf-8",
        async: false,
        success: function (data) {
          if (data.status === false) {
            alert("Error while saving edited CC");
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          hideSpinner();
          if (typeof jqXHR.responseJSON !== "undefined") {
            alert(jqXHR.responseJSON.message);
          } else {
            alert(
              "Network connection error. Please refresh page or try again later"
            );
          }
        },
      });
    } catch (error) {
      hideSpinner();
      alert("Error:", error);
    }
  }
  convertBlobToBase64(blob);
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result);
      } else {
        reject("Error reading blob");
      }
    };
  });
}

function temp11() {
  blobToBase64(file)
    .then((base64String) => {
      // Do something with the base64 string
      console.log("Base64:", base64String);
    })
    .catch((error) => {
      alert("Error:", error);
    });
}
