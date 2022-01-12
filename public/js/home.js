$(document).ready(() => {
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  today.toDateString();
  console.log(yesterday.toISOString().slice(0, 10));

  $(".dateSubhead").text(yesterday.toISOString().slice(0, 10));

  const dateInput = $(".datepicker");

  dateInput.datepicker({
    changeYear: true,
    dateFormat: "yy-mm-dd",
  });

  $("#roverOptions").on("change", () => {
    $("#cameraOptions").empty();
    let rover = $("#roverOptions").val();

    switch (rover) {
      case "Curiosity":
        $("#cameraOptions").append(`
      <option value="FHAZ">Front Hazard Avoidance Camera</option>
      <option value="RHAZ">Rear Hazard Avoidance Camera</option>
      <option value="MAST">Mast Camera</option>
      <option value="CHEMCAM">Chemistry and Camera Complex</option>
      <option value="MAHLI">Mars Hand Lens Imager</option>
      <option value="MARDI">Mars Descent Imager</option>
      <option value="NAVCAM">Navigation Camera</option>
      `);
        break;
      case "Opportunity":
      case "Spirit":
        $("#cameraOptions").append(`
      <option value="FHAZ">Front Hazard Avoidance Camera</option>
      <option value="RHAZ">Rear Hazard Avoidance Camera</option>
      <option value="NAVCAM">Navigation Camera</option>
      <option value="PANAM">Panoramic Camera</option>
      <option value="MINITES">Miniature Thermal Emission Spectrometer (Mini-TES)</option>
      `);
        break;
    }
  });

  $.ajax({
    url: "/images-default",
    type: "get",
  }).then((response) => {
    console.log(response);
    response.photos.forEach((img) => {
      $(".imageRows").append(`
      <div class="col">
        <div class="card shadow-sm">
            <img src=${img.img_src}>
            <div class="card-body">
            <h5 class="card-title">${img.rover.name}</h5>
                <p class="card-text">${img.camera.full_name}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                        <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
                        <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
                    </div>
                    <small class="text-muted">${img.earth_date}</small>
                </div>
            </div>
        </div>
      </div>`);
    });
  });

  $("#loadRoverImages").on("click", function () {
    $(".imageRows").empty();
    $.ajax({
      url: "/images-by-camera",
      type: "GET",
      data: {
        rovers: $("#roverOptions").val(),
        camera: $("#cameraOptions").val(),
        date: $("#date").val(),
      },
    }).then((response) => {
      console.log(response);
      response.photos.forEach((img) => {
        $(".imageRows").append(`
        <div class="col">
          <div class="card shadow-sm">
              <img src=${img.img_src}>
              <div class="card-body">
              <h5 class="card-title">${img.rover.name}</h5>
                  <p class="card-text">${img.camera.full_name}</p>
                  <div class="d-flex justify-content-between align-items-center">
                      <div class="btn-group">
                          <button type="button" class="btn btn-sm btn-outline-secondary">View</button>
                          <button type="button" class="btn btn-sm btn-outline-secondary">Edit</button>
                      </div>
                      <small class="text-muted">${img.earth_date}</small>
                  </div>
              </div>
          </div>
        </div>`);
      });
    });
  });
});
