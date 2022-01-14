$(document).ready(() => {
  //initializes datepicker using jQuery UI datepicker plugin
  const dateInput = $(".datepicker");

  dateInput.datepicker({
    changeYear: true,
    dateFormat: "yy-mm-dd",
  });

  //grabs yesterdays date to write the "dateSubheader" class so the user knows the date of the images that are populated when the page loads.
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  $(".dateSubhead").text(yesterday.toISOString().slice(0, 10));

  //empties the cameraOptions select input any time a new rover is selected so that the new options dont get appened onto the old ones.
  //Instead the old options will empty and the new options will populate the select input.
  //I use a switch case to change the available camera options depending on what rover the user selects, since not all cameras are available to all rovers.
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

  //First ajax call. This gets called when the page first loads and will populate images based on yesterdays date.
  //If there are no images available from yesterdats date, A new background image will display telling the user to search for a new date.
  $.ajax({
    url: "/images-default",
    type: "get",
  }).then((response) => {
    console.log(response);
    const idArr = [];
    $(".lds-roller").hide();
    $(".imageHeader").show();
    if (response.photos.length === 0) {
      $("body").addClass("empty-default-background");
      $("body").removeClass("background-image");
    } else {
      $("body").removeClass("empty-default-background");
      $("body").addClass("background-image");
      response.photos.forEach((img) => {
        idArr.push(`img-${img.id}`);
        $(".roverImageRows").append(`
      <div class="col">
        <div class="card shadow-sm">
            <img src=${img.img_src}>
            <div class="card-body">
              <h5 class="card-title">${img.rover.name}</h5>
                <p class="card-text">${img.camera.full_name}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                    <button  id=img-${img.id} data-url=${img.img_src} type="button" class="btn btn-outline-danger like-btn"><i class="far fa-heart"></i></i></button>
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

      //This is the like button functionality. If a picture is not currently liked, it will not contain the "like" class and it will have the css values in the else statement.
      //When the like button is clicked, it will apply the "like" and "spin" class, giving the button the styles and animation indicating that the picture has been liked.
      //It will also send the ID of the image to local storage. When the page is refreshed, all of the ID's of the images are displayed are compared to the ID's in localStorage
      //If the ID's are a match, the "like" class will be applied to the like button, indicating that the user has previously liked that image.
      $(".like-btn").on("click", function () {
        let id = $(this).attr("id");
        let url = $(this).attr("data-url");
        let items = {
          id: id,
          url: url,
        };
        if ($(this).hasClass("liked")) {
          $(this).css({ "background-color": "transparent", color: "red" });
          $(this).html('<i class="far fa-heart">');
          $(this).removeClass("liked spin");
          localStorage.removeItem(id);
        } else {
          $(this).css({ "background-color": "red", color: "white" });
          $(this).html('<i class="fas fa-heart"></i>');
          $(this).addClass("liked spin");

          localStorage.setItem(id, JSON.stringify(items));
        }
      });
      idArr.forEach((id) => {
        let likeId = JSON.parse(localStorage.getItem(id));
        if (likeId !== null) {
          if (likeId.id === id) {
            $(`#${id}`).css({ "background-color": "red", color: "white" });
            $(`#${id}`).html('<i class="fas fa-heart"></i>');
            $(`#${id}`).addClass("liked");
          }
        }
      });
    }
    //Second ajax call. This ajax function will only run after a use has selected a rover, a camera type, and a date.
    //If no images are returned, a new background image will appear indicating to the user that the search criteria they have chosen has not returned any images.
    $("#loadRoverImages").on("click", function () {
      const rovers = $("#roverOptions").val();
      const camera = $("#cameraOptions").val();
      const date = $("#date").val();
      if (rovers === "" || camera === "" || date === "") {
        alert("Please select a Rover, a Camera and a Date.");
      } else {
        $(".roverImageRows").empty();
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
          console.log(response)
          $(".lds-roller").hide();
          $(".roverSubhead").text(rovers);
          $(".cameraSubhead").text(camera);
          $(".dateSubhead").text(date);
          if (response.photos.length === 0) {
            $("body").addClass("empty-search-background");
            $("body").removeClass("background-image");
            $("body").removeClass("empty-default-background");
          } else {
            $("body").removeClass("empty-search-background");
            $("body").removeClass("empty-default-background");
            $("body").addClass("background-image");
            response.photos.forEach((img) => {
              idArr.push(`img-${img.id}`);
              $(".roverImageRows").append(`
            <div class="col">
            <div class="card shadow-sm">
                <img src=${img.img_src}>
                <div class="card-body">
                  <h5 class="card-title">${img.rover.name}</h5>
                    <p class="card-text fullName">${img.camera.full_name}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                        <button  id=img-${img.id} data-rover-name=${img.rover.name} name=${img.camera.full_name} data-rover-date=${img.earth_date}
                        data-url=${img.img_src} type="button" class="btn btn-outline-danger like-btn"><i class="far fa-heart"></i></button>
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

            //This is the like button functionality. If a picture is not currently liked, it will not contain the "like" class and it will have the css values in the else statement.
            //When the like button is clicked, it will apply the "like" and "spin" class, giving the button the styles and animation indicating that the picture has been liked.
            //It will also send the ID of the image to local storage. When the page is refreshed, all of the ID's of the images are displayed are compared to the ID's in localStorage
            //If the ID's are a match, the "like" class will be applied to the like button, indicating that the user has previously liked that image.
            $(".like-btn").on("click", function () {
              let id = $(this).attr("id");
              let url = $(this).attr("data-url");
              let name = $(this).attr('data-rover-name')
              let fullName = $(this).attr('name')
              let date = $(this).attr('data-rover-date')
              let items = {
                id,
                url,
                name,
                fullName,
                date
              };
              console.log(fullName)
              if ($(this).hasClass("liked")) {
                $(this).css({
                  "background-color": "transparent",
                  color: "red",
                });
                $(this).html('<i class="far fa-heart">');
                $(this).removeClass("liked spin");
                localStorage.removeItem(id);
              } else {
                $(this).html('<i class="fas fa-heart"></i>');
                $(this).addClass("liked spin");
                $(".likedImages").append(`
                <div class="col">
                <div class="card shadow-sm">
                    <img src=${url}>
                    <div class="card-body">
                      <h5 class="card-title">${name}</h5>
                        <p class="card-text">${fullName}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="btn-group">
                            <button  id=img-title data-url=title type="button" class="btn btn-outline-danger like-btn"><i class="far fa-heart"></i></button>
                            </div>
                            <small class="text-muted">${date}</small>
                        </div> 
                    </div>
                    <div class='card-footer'>
                    <h6>Share to:</h6>
                      <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${url}"><i class="fab fa-facebook fa-2x"></i></a>
                      <a target="_blank" href="https://twitter.com/share?url=${url}"><i class="fab fa-twitter fa-2x"></i></a>
                    </div>     
                </div>
              </div>`);
                localStorage.setItem(id, JSON.stringify(items));
              }
            });
            idArr.forEach((id) => {
              let likeId = JSON.parse(localStorage.getItem(id));
              if (likeId !== null) {
                if (likeId.id === id) {
                  $(`#${id}`).css({
                    "background-color": "red",
                    color: "white",
                  });
                  $(`#${id}`).html('<i class="fas fa-heart"></i>');
                  $(`#${id}`).addClass("liked");
                }
              }
            });
          }
        });
      }
    });
    for (let [key, value] of Object.entries(localStorage)) {
      let images = JSON.parse(value)
      console.log(images.url)
      $(".likedImages").append(`
      <div class="col">
      <div class="card shadow-sm">
          <img src=${images.url}>
          <div class="card-body">
            <h5 class="card-title">${images.name}</h5>
              <p class="card-text">${images.fullName}</p>
              <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                  <button type="button" class="btn btn-outline-danger like-btn liked"><i class="fas fa-heart"></i></button>
                  </div>
                  <small class="text-muted">${images.date}</small>
              </div> 
          </div>
          <div class='card-footer'>
          <h6>Share to:</h6>
            <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${images.url}"><i class="fab fa-facebook fa-2x"></i></a>
            <a target="_blank" href="https://twitter.com/share?url=${images.url}"><i class="fab fa-twitter fa-2x"></i></a>
          </div>     
      </div>
    </div>`);
    }
  });
});
