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
      <option value="All">All Cameras</option>
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
      <option value="All">All Cameras</option>
      <option value="FHAZ">Front Hazard Avoidance Camera</option>
      <option value="RHAZ">Rear Hazard Avoidance Camera</option>
      <option value="NAVCAM">Navigation Camera</option>
      <option value="PANCAM">Panoramic Camera</option>
      <option value="MINITES">Miniature Thermal Emission Spectrometer (Mini-TES)</option>
      `);
        break;
    }
  });

  $.ajax({
    url: "/images-default",
    type: "get",
  }).then((response) => {
    const idArr = [];
    $(".lds-roller").hide();
    $(".imageCriteria").show();
    console.log(response);
    if (response.photos.length === 0) {
      $(".imageContainer").append('<img src="../images/empty.jpg />"');
    } else {
      response.photos.forEach((img) => {
        idArr.push(`img-${img.id}`);
        $(".imageRows").append(`
      <div class="col">
        <div class="card shadow-sm">
            <img src=${img.img_src}>
            <div class="card-body">
              <h5 class="card-title">${img.rover.name}</h5>
                <p class="card-text">${img.camera.full_name}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                    <button id=img-${img.id} type="button" class="btn btn-outline-danger like-btn">Like</button>
                    </div>
                    <small class="text-muted">${img.earth_date}</small>
                </div> 
            </div>
            <div class='card-footer'>
            <h6>Share to:</h6>
              <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${img.img_src}"><i class="fab fa-facebook fa-2x"></i></a>
              <a target="_blank" href="https://twitter.com/share?url=${img.img_src}"><i class="fab fa-twitter fa-2x"></i></a>
            </div>     
        </div>
      </div>`);
      });
      $(".like-btn").on("click", function () {
        let id = $(this).attr("id");
        if ($(this).hasClass("liked")) {
          $(this).css({ "background-color": "transparent", color: "red" });
          $(this).html("Like");
          localStorage.removeItem(id);
        } else {
          $(this).css({ "background-color": "red", color: "white" });
          $(this).html("Liked");
          $(this).addClass("liked");

          localStorage.setItem(id, id);
        }
      });
      idArr.forEach((id) => {
        const likeId = localStorage.getItem(id);
        if (likeId === id) {
          $(`#${id}`).css({ "background-color": "red", color: "white" });
          $(`#${id}`).html("Liked");
          $(`#${id}`).addClass("liked");
        }
      });
    }
    $("#loadRoverImages").on("click", function () {
      const rovers = $("#roverOptions").val();
      const camera = $("#cameraOptions").val();
      const date = $("#date").val();
      if (rovers === "" || camera === "" || date === "") {
        alert("Please select a Rover, a Camera and a Date.");
      } else {
        $(".imageRows").empty();
        $(".lds-roller").show();
        $.ajax({
          url: "/images-by-camera",
          type: "POST",
          data: {
            rovers,
            camera,
            date,
          },
        }).then((response) => {
          console.log(response);
          $(".lds-roller").hide();
          $(".roverSubhead").text(rovers);
          $(".cameraSubhead").text(camera);
          $(".dateSubhead").text(date);
          if (response.photos.length === 0) {
            $(".imageRows").append(
              '<img class="empty" src="./images/empty.jpg" />'
            );
          } else {
            response.photos.forEach((img) => {
              idArr.push(`img-${img.id}`);
              $(".imageRows").append(`
            <div class="col">
            <div class="card shadow-sm">
                <img src=${img.img_src}>
                <div class="card-body">
                  <h5 class="card-title">${img.rover.name}</h5>
                    <p class="card-text">${img.camera.full_name}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                        <button id=img-${img.id} type="button" class="btn btn-outline-danger like-btn">Like</button>
                        </div>
                        <small class="text-muted">${img.earth_date}</small>
                    </div> 
                </div>
                <div class='card-footer'>
                <h6>Share to:</h6>
                  <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${img.img_src}"><i class="fab fa-facebook fa-2x"></i></a>
                  <a target="_blank" href="https://twitter.com/share?url=${img.img_src}"><i class="fab fa-twitter fa-2x"></i></a>
                </div>     
            </div>
          </div>`);
            });
            $(".like-btn").on("click", function () {
              let id = $(this).attr("id");
              if ($(this).hasClass("liked")) {
                $(this).css({
                  "background-color": "transparent",
                  color: "red",
                });
                $(this).html("Like");
                localStorage.removeItem(id);
              } else {
                $(this).css({ "background-color": "red", color: "white" });
                $(this).html("Liked");
                $(this).addClass("liked");

                localStorage.setItem(id, id);
              }
            });
            idArr.forEach((id) => {
              const likeId = localStorage.getItem(id);
              if (likeId === id) {
                $(`#${id}`).css({ "background-color": "red", color: "white" });
                $(`#${id}`).html("Liked");
                $(`#${id}`).addClass("liked");
              }
            });
          }
        });
      }
    });
  });
});
