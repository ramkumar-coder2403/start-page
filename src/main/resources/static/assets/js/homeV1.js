var table = null;

$(function () {
  fetchRegularNoYears();
});

function fetchUnmaskedCCTable() {
  var sroCode = "617";
  var rdoc_year = $("#rdoc_year").val();
  var book_no = $("#book_no").val();
  var r_month = $("#r_month").val();
  // var rdoc_nos = $("#rdoc_nos").val();

  if (rdoc_year === "") {
    alert("Please select Regular Doc. Year");
    return;
  }

  if (book_no === "") {
    alert("Please select Book No.");
    return;
  }

  if (r_month === "") {
    alert("Please select Month");
    return;
  }

  // var pattern = /^[0-9,]+$/;
  // if (rdoc_nos !== "" && book_no.trim() !== "") {
  //   if (!pattern.test(rdoc_nos)) {
  //     alert("Please enter valid Regular Doc. No.");
  //     return;
  //   }
  // }
  findUnmaskedDocuments(sroCode, rdoc_year, book_no, r_month);
}

$("#rdoc_nos").on("keypress", function (event) {
  var input = String.fromCharCode(event.which);
  var regex = /[0-9,]/;
  if (!regex.test(input)) {
    event.preventDefault();
    return false;
  }
});

$("#rdoc_nos")
  .on("dragstart", function (event) {
    event.preventDefault();
  })
  .on("dragover drop", function (event) {
    event.preventDefault();
  })
  .on("copy", function (event) {
    event.preventDefault();
  })
  .on("paste", function (event) {
    event.preventDefault();
  });

function fetchRegularNoYears() {
  $.ajax({
    type: "GET",
    url: "http://localhost:8080/rest/home/v1/years",
    beforeSend: function () {
      //   $(".modal").show();
    },
    complete: function () {
      //   $(".modal").hide();
    },
    dataType: "json",
    data: {},
    success: function (data) {
      var str = "";
      $.each(data, function (idx, val) {
        str += '<option value="' + val + '">' + val + "</option>";
      });
      $("#rdoc_year").html(str);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      if (typeof jqXHR.responseJSON !== "undefined") {
        // console.log(jqXHR);
        alert(jqXHR.responseJSON.message);
      } else {
        alert(
          "Network connection error. Please refresh page or try again later"
        );
      }
    },
  });
}

function findUnmaskedDocuments(sroCode, rdocYear, bookNo, month) {
  //Clear
  $("#div_cc_details").html("");
  //Fetch
  createCCDetTable();
  dataTableUnmaskedCCFetch(sroCode, rdocYear, bookNo, month);
}

function createCCDetTable() {
  var tblStr = '<div class="table-responsive">';
  tblStr +=
    '<table id="tbl_cc_det" class="table table-sm table-bordered display tbl-doc-det table-striped text-center align-middle small w-100">';
  tblStr +=
    '<caption style="caption-side: top">Unmasked CC Details' +
    '<br><small class="text-danger fw-bold">Note: 5 documents can be requested for each bulk mask.</small>' +
    "</caption>";
  tblStr += "</table></div>";
  $("#div_cc_details").html(tblStr);
}

function findMaskedDocuments() {
  var sroCode = "617";
  var rdoc_year = $("#rdoc_year").val();
  var book_no = $("#book_no").val();
  var r_month = $("#r_month").val();
  // var rdoc_nos = $("#rdoc_nos").val();

  if (rdoc_year === "") {
    alert("Please select Regular Doc. Year");
    return;
  }

  if (book_no === "") {
    alert("Please select Book No.");
    return;
  }

  if (r_month === "") {
    alert("Please select Month");
    return;
  }

  //Clear
  $("#div_maksed_cc_details").html("");
  //Fetch
  createCCMaskedDetTable();
  dataTableMaskedCCDetailsFetch(sroCode, rdoc_year, book_no, r_month);
}

function createCCMaskedDetTable() {
  var tblStr = '<div class="table-responsive">';
  tblStr +=
    '<table id="tbl_cc_masked_det" class="table table-sm table-bordered display tbl-doc-det table-striped text-center align-middle small w-100">';
  tblStr +=
    '<caption style="caption-side: top">Masked CC Details' + "</caption>";
  tblStr += "</table></div>";
  $("#div_maksed_cc_details").html(tblStr);
}

function dataTableMaskedCCDetailsFetch(sroCode, rdocYear, bookNo, month) {
  $("#div_cc_masked").html("");
  $("#zipDownload").addClass("d-none");
  $("#div_cc_details").html("");
  $("#divBulkMaskBtn").addClass("d-none");

  let jsonData = {
    sroCode: sroCode,
    bookNo: bookNo,
    regularNoYear: rdocYear,
    month: month,
  };
  // if (rdocNos !== null && rdocNos.trim() !== "") {
  //   $.extend(jsonData, { regularNos: rdocNos });
  // }

  let jsonStr = JSON.stringify(jsonData);

  table = $("#tbl_cc_masked_det").DataTable({
    destroy: true,
    ajax: {
      type: "POST",
      url: "http://localhost:8080/rest/home/v1/cc-masked-details",
      dataType: "json",
      contentType: "application/json",
      async: false,
      data: function (d) {
        return jsonStr;
      },
      complete: function (data) {
        data = data.responseJSON;
        if (typeof data !== "undefined") {
          // callback when request completed
          var size = data.dataSize;
          if (size > 0) {
            $("#zipDownloadMasked").removeClass("d-none");
          } else {
            $("#zipDownloadMasked").addClass("d-none");
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (typeof jqXHR.responseJSON !== "undefined") {
          // console.log(jqXHR);
          alert(jqXHR.responseJSON.message);
        } else {
          alert(
            "Network connection error. Please refresh page or try again later"
          );
        }
        //Clear
        $("#div_maksed_cc_details").html("");
        // $("#divBulkMaskBtn").addClass("d-none");
      },
    },
    columnDefs: [
      { width: 280, targets: -1 },
      { className: "align-middle text-center", targets: "_all" },
      { width: 50, targets: [0, 1, 2] },
      { width: 200, targets: [7] },
    ],
    columns: [
      {
        title: "Select<br>",
        render: DataTable.render.select(),
        targets: 0,
      },
      { data: "sroCode", title: "SRO Code" },
      { data: "bookNo", title: "Book No." },
      { data: "regularNoYear", title: "Regular Doc.&nbsp;Year" },
      { data: "regularNo", title: "Regular Doc.&nbsp;No." },
      {
        data: null,
        title: "Document Nature",
        render: function (data, type, row) {
          if (row["documentNature"] == null) {
            return "-";
          }
          return row["documentNature"];
        },
      },
      { data: "presenterName", title: "Presenter Name" },
      {
        data: "regularNoDate",
        title:
          "Regular No. Date<br>" +
          '<small style="font-size: 11px;">(dd-mm-yyyy&nbsp;hh:mi:ss&nbsp;tt)</small>',
      },

      {
        data: null,
        title: "Action",
        render: function (data, type, row) {
          var str = "";
          str += '<div class="d-flex gap-2 justify-content-center">';
          str +=
            '<button class="btn btn-sm btn-outline-primary px-3"' +
            " onclick=maskedCCPreview('" +
            row["documentID"] +
            "')>Preview</button>";
          str +=
            '<button class="btn btn-sm btn-outline-success px-3"' +
            " onclick=maskedCCDownload('" +
            row["documentID"] +
            "')>Download</button>";

          str += "</div>";
          return str;
        },
      },
    ],
    // fixedColumns: {
    //   start: 2,
    // },
    processing: true,
    // serverSide: true,
    paging: false,
    scrollCollapse: true,
    // scrollX: true,
    scrollY: 300,
    select: {
      style: "multi",
      selector: "td:first-child",
      headerCheckbox: true,
    },
    initComplete: function () {
      $(this.api().table().container())
        .find("input")
        .attr("autocomplete", "off");
      $(this.api().table().container())
        .find("input")
        .css("text-transform", "uppercase");
    },
  });
}

function dataTableUnmaskedCCFetch(sroCode, rdocYear, bookNo, month) {
  $("#div_cc_masked").html("");
  $("#zipDownload").addClass("d-none");

  $("#div_maksed_cc_details").html("");
  $("#zipDownloadMasked").addClass("d-none");

  let jsonData = {
    sroCode: sroCode,
    bookNo: bookNo,
    regularNoYear: rdocYear,
    month: month,
  };
  // if (rdocNos !== null && rdocNos.trim() !== "") {
  //   $.extend(jsonData, { regularNos: rdocNos });
  // }

  let jsonStr = JSON.stringify(jsonData);

  table = $("#tbl_cc_det").DataTable({
    destroy: true,
    ajax: {
      type: "POST",
      url: "http://localhost:8080/rest/home/v1/doc-details",
      dataType: "json",
      contentType: "application/json",
      async: false,
      data: function (d) {
        return jsonStr;
      },
      complete: function (data) {
        data = data.responseJSON;
        if (typeof data !== "undefined") {
          // callback when request completed
          var size = data.dataSize;
          if (size > 0) {
            $("#divBulkMaskBtn").removeClass("d-none");
          } else {
            $("#divBulkMaskBtn").addClass("d-none");
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (typeof jqXHR.responseJSON !== "undefined") {
          // console.log(jqXHR);
          alert(jqXHR.responseJSON.message);
        } else {
          alert(
            "Network connection error. Please refresh page or try again later"
          );
        }
        //Clear
        $("#div_cc_details").html("");
        $("#divBulkMaskBtn").addClass("d-none");
      },
    },
    columnDefs: [
      { width: 280, targets: -1 },
      { className: "align-middle text-center", targets: "_all" },
      { width: 50, targets: [0, 1, 2] },
      { width: 200, targets: [7] },
    ],
    columns: [
      {
        title: "Select<br>",
        render: DataTable.render.select(),
        targets: 0,
      },
      { data: "sroCode", title: "SRO Code" },
      { data: "bookNo", title: "Book No." },
      { data: "regularNoYear", title: "Regular Doc.&nbsp;Year" },
      { data: "regularNo", title: "Regular Doc.&nbsp;No." },
      {
        data: null,
        title: "Document Nature",
        render: function (data, type, row) {
          if (row["documentNature"] == null) {
            return "-";
          }
          return row["documentNature"];
        },
      },
      { data: "presenterName", title: "Presenter Name" },
      {
        data: "regularNoDate",
        title:
          "Regular No. Date<br>" +
          '<small style="font-size: 11px;">(dd-mm-yyyy&nbsp;hh:mi:ss&nbsp;tt)</small>',
      },

      {
        data: null,
        title: "Action",
        render: function (data, type, row) {
          var str = "";
          str += '<div class="d-flex gap-2 justify-content-center">';
          str +=
            '<button class="btn btn-sm btn-outline-primary px-3"' +
            " onclick=ccPreview('" +
            row["documentID"] +
            "')>Preview CC</button>";
          str +=
            '<button class="btn btn-sm btn-outline-success px-3"' +
            " onclick=maskSingleCC('" +
            row["documentID"] +
            "')>Mask CC</button>";

          str += "</div>";
          return str;
        },
      },
    ],
    // fixedColumns: {
    //   start: 2,
    // },
    processing: true,
    // serverSide: true,
    paging: false,
    scrollCollapse: true,
    // scrollX: true,
    scrollY: 300,
    select: {
      style: "multi",
      selector: "td:first-child",
      headerCheckbox: true,
    },
    initComplete: function () {
      $(this.api().table().container())
        .find("input")
        .attr("autocomplete", "off");
      $(this.api().table().container())
        .find("input")
        .css("text-transform", "uppercase");
    },
  });
}

function multipleCCMasking() {
  if (table === null) {
    alert("Option is invalid");
    return;
  }
  var selectedRows = table.rows({ selected: true }).data().toArray();
  var len = selectedRows.length;
  if (len < 2) {
    alert("Please select atleast 2 CC to mask");
    return;
  }
  if (len > 5) {
    alert("Limit exceeded: Upto 5 documents only allowed");
    return;
  }

  var ids = [];
  $.each(selectedRows, function (key, obj) {
    ids.push(obj.documentID);
  });
  createCCMaskedTable();
  dataTableMaskedCCFetch(ids);
}
// -----------
// CC Masked Table

function createCCMaskedTable() {
  var tblStr = '<div class="table-responsive">';
  tblStr +=
    '<table id="tbl_cc_mask" class="table table-sm table-bordered display tbl-doc-masked table-striped text-center align-middle small w-100">';
  tblStr += '<caption style="caption-side: top">Masked CC Details</caption>';
  tblStr += "</table></div>";
  $("#div_cc_masked").html(tblStr);
}
var zipIDs = [];

function dataTableMaskedCCFetch(ids) {
  let jsonData = { ids: ids };
  let jsonStr = JSON.stringify(jsonData);

  table = $("#tbl_cc_mask").DataTable({
    destroy: true,
    ajax: {
      type: "POST",
      url: "http://localhost:8080/rest/home/v1/multiple-mask-test",
      dataType: "json",
      contentType: "application/json",
      async: false,
      data: function (d) {
        return jsonStr;
      },
      beforeSend: function () {
        showSpinner();
      },
      complete: function (data) {
        hideSpinner();

        data = data.responseJSON;
        if (typeof data !== "undefined") {
          var jArr = data.data;

          $.each(jArr, function (idx, obj) {
            if (obj.maskStatus === true) {
              zipIDs.push(obj.id);
            }
          });

          var size = data.dataSize;
          if (size > 0) {
            $("#zipDownload").removeClass("d-none");
          } else {
            $("#zipDownload").addClass("d-none");
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        if (typeof jqXHR.responseJSON !== "undefined") {
          // console.log(jqXHR);
          alert(jqXHR.responseJSON.message);
        } else {
          alert(
            "Network connection error. Please refresh page or try again later"
          );
        }
        //Clear
        $("#div_cc_masked").html("");
        $("#zipDownload").addClass("d-none");
        zipIDs = [];
      },
    },
    columnDefs: [
      { width: 280, targets: -1 },
      { className: "align-middle text-center", targets: "_all" },
      // { width: 50, targets: [0, 1] },
      // { width: 150, targets: [2, 3, 4] },
    ],
    columns: [
      { data: "sroCode", title: "SRO Code" },
      { data: "bookNo", title: "Book No." },
      { data: "regularNoYear", title: "Regular Doc.&nbsp;Year" },
      { data: "regularNo", title: "Regular Doc.&nbsp;No." },
      {
        data: null,
        title: "Masking Status",
        render: function (data, type, row) {
          if (row["maskStatus"] == true) {
            return '<img src="./assets/images/success-48.png" width="25" height="25" alt="success">';
          } else {
            return '<img src="./assets/images/cancel-48.png" width="25" height="25" alt="success">';
          }
        },
      },
      {
        data: null,
        title: "Message",
        render: function (data, type, row) {
          if (
            typeof row["failureMsg"] === "undefined" ||
            row["failureMsg"] === null
          ) {
            return "-";
          }
          return row["failureMsg"];
        },
      },

      {
        data: null,
        title: "Action",
        render: function (data, type, row) {
          var str = "";
          if (row["maskStatus"] == true) {
            str += '<div class="d-flex gap-2 justify-content-center">';
            str +=
              '<button class="btn btn-sm btn-outline-primary px-3"' +
              " onclick=maskedCCPreview('" +
              row["id"] +
              "')>Preview</button>";
            str +=
              '<button class="btn btn-sm btn-outline-success px-3"' +
              " onclick=maskedCCDownload('" +
              row["id"] +
              "')>Download</button>";
            str += "</div>";
            return str;
          }
          return '-';
        },
      },
    ],
    processing: true,
    paging: false,
    scrollCollapse: true,
    searching: false,
    info: false,
  });
}
// --------------- ZIP DOWNLOAD
function downloadZip() {
  let jsonData = { ids: zipIDs };
  let jsonStr = JSON.stringify(jsonData);

  $.ajax({
    type: "POST",
    url: "http://localhost:8080/rest/home/v1/zip-download",
    beforeSend: function () {
      showSpinner();
    },
    complete: function () {
      hideSpinner();
    },
    xhrFields: {
      responseType: "blob",
    },
    data: jsonStr,
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      var filename = "MaskedCCFiles.zip";
      var a = document.createElement("a");
      a.href = URL.createObjectURL(data);
      a.setAttribute("download", filename);
      a.click();
    },
    error: function (jqXHR, textStatus, errorThrown) {
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
function downloadMaskedCCZip() {
  if (table === null) {
    alert("Option is invalid");
    return;
  }
  var selectedRows = table.rows({ selected: true }).data().toArray();
  var len = selectedRows.length;
  if (len < 2) {
    alert("Please select atleast 2 CC to mask");
    return;
  }
  if (len > 5) {
    alert("Limit exceeded: Upto 5 documents only allowed");
    return;
  }

  var ids = [];
  $.each(selectedRows, function (key, obj) {
    ids.push(obj.documentID);
  });

  let jsonData = { ids: ids };
  let jsonStr = JSON.stringify(jsonData);

  $.ajax({
    type: "POST",
    url: "http://localhost:8080/rest/home/v1/zip-download",
    beforeSend: function () {
      showSpinner();
    },
    complete: function () {
      hideSpinner();
    },
    xhrFields: {
      responseType: "blob",
    },
    data: jsonStr,
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      var filename = "MaskedCCFiles.zip";
      var a = document.createElement("a");
      a.href = URL.createObjectURL(data);
      a.setAttribute("download", filename);
      a.click();
    },
    error: function (jqXHR, textStatus, errorThrown) {
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
