let imageCount = 0;
const idArr = [];
$(document).ready(() => {
  //grabs yesterdays date to write the "dateSubheader" class so the user knows the date of the images that are populated when the page loads.
  const today = new Date();
  const yesterday = new Date(today);

  yesterday.setDate(yesterday.getDate() - 1);

  $(".dateSubhead").text(yesterday.toISOString().slice(0, 10));

  //selector variable for the datepicker 
  const dateInput = $(".datepicker");

  //empties the cameraOptions select input any time a new rover is selected so that the new options dont get appened onto the old ones.
  //Instead the old options will empty and the new options will populate the select input.
  //I use a switch case to change the available camera options and the max date allowed on the datepicker depending on what rover the user selects.
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
        dateInput.datepicker("destroy");
        dateInput.datepicker({
          changeYear: true,
          dateFormat: "yy-mm-dd",
          maxDate: yesterday,
        });
        break;
      case "Opportunity":
        $("#cameraOptions").append(`
      <option value="All">All Cameras</option>
      <option value="FHAZ">Front Hazard Avoidance Camera</option>
      <option value="RHAZ">Rear Hazard Avoidance Camera</option>
      <option value="NAVCAM">Navigation Camera</option>
      <option value="PANCAM">Panoramic Camera</option>
      <option value="MINITES">Miniature Thermal Emission Spectrometer (Mini-TES)</option>
      `);
        dateInput.datepicker("destroy");
        dateInput.datepicker({
          changeYear: true,
          dateFormat: "yy-mm-dd",
          maxDate: "2018-06-09",
        });
        break;
      case "Spirit":
        $("#cameraOptions").append(`
          <option value="All">All Cameras</option>
          <option value="FHAZ">Front Hazard Avoidance Camera</option>
          <option value="RHAZ">Rear Hazard Avoidance Camera</option>
          <option value="NAVCAM">Navigation Camera</option>
          <option value="PANCAM">Panoramic Camera</option>
          <option value="MINITES">Miniature Thermal Emission Spectrometer (Mini-TES)</option>
          `);
        dateInput.datepicker("destroy");
        dateInput.datepicker({
          changeYear: true,
          dateFormat: "yy-mm-dd",
          maxDate: "2010-03-21",
        });
    }
  });

  //Button click event that calls the loadImagesByCamera function. All three inputs must be filled out before the ajax call will run.
  $("#loadRoverImages").on("click", function () {
    const rovers = $("#roverOptions").val();
    const camera = $("#cameraOptions").val();
    const date = $("#date").val();
    console.log(rovers, camera, date);
    if (rovers === null || camera === null || date === "") {
      alert("Please select a Rover, a Camera and a Date.");
    } else {
      $(".imageSection").find('h1').hide();
      $(".roverImageRows").empty();
      $(".lds-roller").show();
      loadImagesByCamera();
    }
  });

  //This ajax call will only run after a use has selected a rover, a camera type, and a date.
  //If no images are returned from the API, a new background image will appear indicating to the user that the search criteria they have chosen has not returned any images.
  const loadImagesByCamera = () => {
    const rovers = $("#roverOptions").val();
    const camera = $("#cameraOptions").val();
    const date = $("#date").val();
    $.ajax({
      url: "/images-by-camera",
      type: "POST",
      data: {
        rovers,
        camera,
        date,
      },
      error: function (xhr, status, error, response) {
        if (xhr.status === 504 || xhr.status === 503) {
          loadImages();
        }
      },
    }).then((response) => {
      $(".lds-roller").hide();
      $(".imageHeader").show();
      $(".roverSubhead").text(rovers);
      $(".cameraSubhead").text(camera);
      $(".dateSubhead").text(date);

      if (response.photos.length === 0) {
        $("body").addClass("empty-search-background");
        $("body").removeClass("background-image");
      } else {
        $("body").removeClass("empty-search-background");
        $("body").addClass("background-image");
        //When the ajax call return with data, I loop through the response and add a card to the roverImageRow for each data point.
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
                      <button id=img-${img.id} data-col-id=col-${img.id} data-id=${img.id} data-rover-name=${img.rover.name} data-camera-name=${img.camera.name} data-rover-date=${img.earth_date}
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

       //This is the like button functionality. A button is unliked be default and will contain the css class "unliked". When the like button is clicked, the css class of "liked and spin"
       //will be added to the button and the "unliked" class will be removed.
        $(".like-btn").on("click", function () {
          let id = $(this).attr("id");
          let intId = $(this).attr("data-id");
          let colId = $(this).attr("data-col-id");
          let url = $(this).attr("data-url");
          let name = $(this).attr("data-rover-name");
          let cameraName = $(this).attr("data-camera-name");
          let date = $(this).attr("data-rover-date");
          let items = {
            id,
            url,
            name,
            cameraName,
            date,
            intId,
            colId,
          };
          //Depending on the classes that the like button has, it will either add or subtract from the liked Image counter and will add or remove images to the liked image modal.
          //It will also either remove or add the id to localStorage.
          if ($(this).hasClass("liked")) {
            $(this).addClass("unliked");
            imageCount--;
            $(".likedCount").html(`(${imageCount})`);
            $(".likedImages").find(`#${colId}`).remove();
            $(this).html('<i class="far fa-heart">');
            $(this).removeClass("liked spin");
            localStorage.removeItem(id);
          } else {
            //For every image that gets liked, a card will append to the liked modal so the user can keep track of their liked images while theyre using the app.
            imageCount++;
            $(".likedCount").html(`(${imageCount})`);
            $(this).html('<i class="fas fa-heart"></i>');
            $(this).removeClass("unliked");
            $(this).addClass("liked spin");
            $(".likedImages").append(`
              <div id=${colId} class="col">
              <div class="card shadow-sm">
                  <img src=${url}>
                  <div class="card-body">
                    <h5 class="card-title">${name}</h5>
                      <p class="card-text">${cameraName}</p>
                      <div class="d-flex justify-content-between align-items-center">
                          <div class="btn-group">
                          <button disabled type="button" class="btn btn-outline-danger like-btn remove liked"><i class="fas fa-heart"></i></button>
                          <button id=${intId} data-id=${id} data-col-id=${colId} type="button" class="btn btn-success remove">Remove</button>
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
          //A remove button is added to each image thats appended to the liked image modal. When the remove button is clicked, it finds the id of the column and removes it from the modal.
          //It also removes the id from localStorage and removes the liked class from the original like button.
          $(`#${intId}`).on("click", function () {
            imageCount--;
            $(".likedCount").html(`(${imageCount})`);
            let dataId = $(this).attr("data-id");
            let colId = $(this).attr("data-col-id");
            $(".likedImages").find(`#${colId}`).remove();
            $(`#${dataId}`)
              .html('<i class="far fa-heart">')
              .removeClass("liked spin")
              .addClass("unliked");
            localStorage.removeItem(dataId);
          });
        });

        //After the ajax call has succesfully finished running, all of the ID's of the images displayed on the page get pushed to the idArr.
        //This function comares the ID's in the idArr to the ID's in localStorage. If the ID's match, the css class "liked" will be added to the button
        //so the user can see that they had liked that image from a previous session.
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
  };

  //This for loop runs on page load. It loops through localStorage and appends a card for each data point into the liked image modal and the roveImageRows section.
  for (let [key, value] of Object.entries(localStorage)) {
    let images = JSON.parse(value);
    imageCount++;
    console.log(images);
 
      $(".likedCount").html(`(${imageCount})`);
      $(".likedImages, .roverImageRows").append(`
      <div id=${images.colId} class="col">
      <div class="card shadow-sm">
          <img src=${images.url}>
          <div class="card-body">
            <h5 class="card-title">${images.name}</h5>
              <p class="card-text">${images.cameraName}</p>
              <div class="d-flex justify-content-between align-items-center">
                  <div class="btn-group">
                  <button disabled type="button" class="btn btn-outline-danger like-btn liked"><i class="fas fa-heart"></i></button>
                  <button id=${images.intId} data-id=${images.id}  type="button" class="btn btn-success remove">Remove</button>
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
    //A remove button is added to each image thats appended to the liked image modal. When the remove button is clicked, it finds the id of the column and removes it from the modal.
    //It also removes the id from localStorage and removes the liked class from the original like button.
      $(`.likedImages #${images.intId}, .roverImageRows #${images.intId}`).on("click", function () {
        imageCount--;
        $(".likedCount").html(`(${imageCount})`);
        let dataId = $(this).attr("data-id");
        $(".likedImages, .roverImageRows").find(`#${images.colId}`).remove();
        $(`#${dataId}`)
          .html('<i class="far fa-heart">')
          .removeClass("liked spin")
          .addClass("unliked");
        localStorage.removeItem(dataId);
      });
  }
});
