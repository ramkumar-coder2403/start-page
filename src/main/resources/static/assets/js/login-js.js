$(function () {
  fetchDrList();
});

$("#username, #password")
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

function fetchDrList() {
  $.ajax({
    type: "GET",
    url: "http://localhost:8080/rest/no-auth/v1/dr-list",
    beforeSend: function () {
      //   $(".modal").show();
    },
    complete: function () {
      //   $(".modal").hide();
    },
    dataType: "json",
    data: {},
    success: function (data) {
      var str = '<option value="">SELECT</option>';
      $.each(data, function (idx, obj) {
        str += '<option value="' + obj.value + '">' + obj.name + "</option>";
      });
      $("#dr_code").html(str);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // console.log(jqXHR);
      alert(jqXHR.responseJSON.message);
      //Other
      var str = '<option value="">SELECT</option>';
      $("#dr_code").html(str);
    },
  });
}

$("#dr_code").on("change", function () {
  let drCode = $("#dr_code").val();
  if (drCode !== null && drCode !== "") {
    fetchSroList(drCode);
  } else {
    var str = '<option value="">SELECT</option>';
    $("#sro_code").html(str);
  }
});

function fetchSroList(drCode) {
  $.ajax({
    type: "GET",
    url: "http://localhost:8080/rest/no-auth/v1/sro-list",
    beforeSend: function () {
      //   $(".modal").show();
    },
    complete: function () {
      //   $(".modal").hide();
    },
    dataType: "json",
    data: {
      "dr-code": drCode,
    },
    success: function (data) {
      var str = '<option value="">SELECT</option>';
      $.each(data, function (idx, obj) {
        str += '<option value="' + obj.value + '">' + obj.name + "</option>";
      });
      $("#sro_code").html(str);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // console.log(jqXHR);
      alert(jqXHR.responseJSON.message);
      //Other
      var str = '<option value="">SELECT</option>';
      $("#sro_code").html(str);
    },
  });
}

function validateSubmitForm() {
  let drCode = $("#dr_code").val();
  let srCode = $("#sro_code").val();
  let uname = $("#username").val();
  let password = $("#password").val();

  if (drCode === "") {
    alert("Please select DRO");
    return false;
  }
  if (srCode === "") {
    alert("Please select SRO");
    return false;
  }
  if (uname === "") {
    alert("Please enter username");
    return false;
  }
  if (password === "") {
    alert("Please enter password");
    return false;
  }
  return true;
}

$("#dr_code, #sro_code, #username, #password").keypress(function (event) {
  var key = event.keyCode;
  if (key === 13) {
    submitForm();
  }
});

function submitForm() {
  if (validateSubmitForm()) {
    let pwd = $("#password").val();
    $("#password").val(md5(pwd));
    $('#loginForm').submit();
  }else{
    $("#password").val('');
  }
}
