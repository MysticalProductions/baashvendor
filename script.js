/* =========================================================
   BAASH VENUE REGISTRATION
   FRONTEND SCRIPT
========================================================= */


/* =========================================================
   GOOGLE APPS SCRIPT WEB APP URL
========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxMz48LASOHJ4lMvArhtYQpjl-Kp-GSVRN0CN_6YSL8yBAWHJ7ayAK9FejV7H8Br-77/exec";


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentStep = 1;

let drawing = false;

let hasSignature = false;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const form =
  document.getElementById(
    "registrationForm"
  );


const formSteps =
  Array.from(
    document.querySelectorAll(
      ".form-step"
    )
  );


const progressItems =
  Array.from(
    document.querySelectorAll(
      ".progress-item"
    )
  );


const canvas =
  document.getElementById(
    "signaturePad"
  );


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeNavigation();

    initializeFileUploads();

    initializeSignature();

    initializeForm();

    showStep(1);

  }
);


/* =========================================================
   NAVIGATION INITIALIZATION
========================================================= */

function initializeNavigation() {

  /*
   * NEXT BUTTONS
   *
   * Section 1 -> Section 2
   * Section 2 -> Section 3
   * Section 3 -> Section 4
   */

  const nextButtons =
    document.querySelectorAll(
      ".next"
    );


  nextButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          console.log(
            "Continue clicked. Current step:",
            currentStep
          );


          nextStep();

        }
      );

    }
  );


  /*
   * BACK BUTTONS
   */

  const prevButtons =
    document.querySelectorAll(
      ".prev"
    );


  prevButtons.forEach(
    function (button) {

      button.addEventListener(
        "click",
        function (event) {

          event.preventDefault();

          prevStep();

        }
      );

    }
  );

}


/* =========================================================
   SHOW STEP
========================================================= */

function showStep(
  step
) {

  if (
    step < 1 ||
    step > formSteps.length
  ) {

    return;

  }


  currentStep = step;


  /*
   * Hide / show sections
   */

  formSteps.forEach(
    function (section) {

      const sectionStep =
        Number(
          section.dataset.step
        );


      section.classList.toggle(
        "active",
        sectionStep === step
      );

    }
  );


  /*
   * Update progress
   */

  progressItems.forEach(
    function (item) {

      const itemStep =
        Number(
          item.dataset.step
        );


      item.classList.toggle(
        "active",
        itemStep === step
      );


      item.classList.toggle(
        "done",
        itemStep < step
      );

    }
  );


  /*
   * Step number
   */

  const stepNumber =
    document.getElementById(
      "stepNumber"
    );


  if (stepNumber) {

    stepNumber.textContent =
      step;

  }


  /*
   * Populate agreement
   * when entering Step 4
   */

  if (step === 4) {

    populateAgreement();

  }


  /*
   * Scroll to top
   */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   NEXT STEP
========================================================= */

function nextStep() {

  /*
   * Validate current section
   */

  if (
    !validateStep(
      currentStep
    )
  ) {

    return;

  }


  /*
   * Go to next section
   */

  if (
    currentStep <
    formSteps.length
  ) {

    showStep(
      currentStep + 1
    );

  }

}


/* =========================================================
   PREVIOUS STEP
========================================================= */

function prevStep() {

  if (
    currentStep > 1
  ) {

    showStep(
      currentStep - 1
    );

  }

}


/* =========================================================
   VALIDATE STEP
========================================================= */

function validateStep(
  step
) {

  const section =
    document.querySelector(
      '.form-step[data-step="' +
      step +
      '"]'
    );


  if (!section) {

    console.error(
      "Step not found:",
      step
    );

    return false;

  }


  /*
   * Required normal inputs
   */

  const requiredFields =
    Array.from(
      section.querySelectorAll(
        "input[required], select[required], textarea[required]"
      )
    );


  for (
    const field
    of requiredFields
  ) {


    /* ---------------------------------
       FILE INPUT
    --------------------------------- */

    if (
      field.type === "file"
    ) {

      if (
        !field.files ||
        field.files.length === 0
      ) {

        const card =
          field.closest(
            ".upload-card"
          );


        let documentName =
          "the required document";


        if (card) {

          const title =
            card.querySelector(
              "strong"
            );


          if (title) {

            documentName =
              title.textContent.trim();

          }

        }


        alert(
          "Please upload " +
          documentName
        );


        return false;

      }


      /*
       * 10 MB limit
       */

      if (
        field.files[0].size >
        10 * 1024 * 1024
      ) {

        alert(
          "Each document must be less than 10 MB."
        );


        return false;

      }


      continue;

    }


    /* ---------------------------------
       CHECKBOX
    --------------------------------- */

    if (
      field.type === "checkbox"
    ) {

      if (
        !field.checked
      ) {

        alert(
          "Please confirm the required declaration."
        );


        field.focus();


        return false;

      }


      continue;

    }


    /* ---------------------------------
       NORMAL FIELD
    --------------------------------- */

    if (
      !String(
        field.value || ""
      ).trim()
    ) {

      alert(
        "Please complete all required fields."
      );


      field.focus();


      return false;

    }


    /*
     * Email / HTML validation
     */

    if (
      !field.checkValidity()
    ) {

      field.reportValidity();


      return false;

    }

  }


  /*
   * Agreement-specific validation
   */

  if (
    step === 4
  ) {

    const agreementAccepted =
      document.getElementById(
        "agreementAccepted"
      );


    if (
      !agreementAccepted ||
      !agreementAccepted.checked
    ) {

      alert(
        "Please accept the BAASH Vendor Agreement."
      );


      return false;

    }


    const signatureName =
      document.getElementById(
        "signatureName"
      );


    if (
      !signatureName ||
      !signatureName.value.trim()
    ) {

      alert(
        "Please enter the full legal name of the signatory."
      );


      if (signatureName) {

        signatureName.focus();

      }


      return false;

    }


    if (
      !hasSignature
    ) {

      alert(
        "Please draw your digital signature."
      );


      return false;

    }

  }


  return true;

}


/* =========================================================
   FILE UPLOADS
========================================================= */

function initializeFileUploads() {

  const fileInputs =
    document.querySelectorAll(
      '.upload-card input[type="file"]'
    );


  fileInputs.forEach(
    function (input) {

      input.addEventListener(
        "change",
        function () {

          const card =
            input.closest(
              ".upload-card"
            );


          if (!card) {

            return;

          }


          const fileName =
            card.querySelector(
              ".file-name"
            );


          if (!fileName) {

            return;

          }


          if (
            input.files &&
            input.files.length > 0
          ) {

            fileName.textContent =
              input.files[0].name;

          } else {

            fileName.textContent =
              "Choose file";

          }

        }
      );

    }
  );

}


/* =========================================================
   AGREEMENT
========================================================= */

function populateAgreement() {

  const venueName =
    getValue(
      "venueName"
    );


  const legalName =
    getValue(
      "legalName"
    );


  const ownerName =
    getValue(
      "ownerName"
    );


  const agreementVenue =
    document.getElementById(
      "agreementVenue"
    );


  const agreementLegal =
    document.getElementById(
      "agreementLegal"
    );


  const agreementOwner =
    document.getElementById(
      "agreementOwner"
    );


  if (agreementVenue) {

    agreementVenue.value =
      venueName || "—";

  }


  if (agreementLegal) {

    agreementLegal.value =
      legalName || "—";

  }


  if (agreementOwner) {

    agreementOwner.value =
      ownerName || "—";

  }


  /*
   * Automatically populate signer name
   * with legal name first.
   */

  const signatureName =
    document.getElementById(
      "signatureName"
    );


  if (
    signatureName &&
    !signatureName.value.trim()
  ) {

    signatureName.value =
      legalName ||
      ownerName ||
      "";

  }

}


/* =========================================================
   GET VALUE
========================================================= */

function getValue(
  id
) {

  const element =
    document.getElementById(
      id
    );


  if (!element) {

    return "";

  }


  return String(
    element.value || ""
  ).trim();

}


/* =========================================================
   SIGNATURE INITIALIZATION
========================================================= */

function initializeSignature() {

  if (!canvas) {

    console.error(
      "Signature canvas not found."
    );


    return;

  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  ctx.lineWidth =
    2.5;


  ctx.lineCap =
    "round";


  ctx.lineJoin =
    "round";


  /*
   * Mouse
   */

  canvas.addEventListener(
    "mousedown",
    startSignature
  );


  canvas.addEventListener(
    "mousemove",
    drawSignature
  );


  window.addEventListener(
    "mouseup",
    stopSignature
  );


  /*
   * Touch
   */

  canvas.addEventListener(
    "touchstart",
    startSignature,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "touchmove",
    drawSignature,
    {
      passive: false
    }
  );


  canvas.addEventListener(
    "touchend",
    stopSignature
  );


  /*
   * Clear
   */

  const clearButton =
    document.getElementById(
      "clearSignature"
    );


  if (clearButton) {

    clearButton.addEventListener(
      "click",
      clearSignature
    );

  }

}


/* =========================================================
   SIGNATURE POSITION
========================================================= */

function getCanvasPoint(
  event
) {

  const rect =
    canvas.getBoundingClientRect();


  let clientX;

  let clientY;


  if (
    event.touches &&
    event.touches.length > 0
  ) {

    clientX =
      event.touches[0].clientX;


    clientY =
      event.touches[0].clientY;

  } else {

    clientX =
      event.clientX;


    clientY =
      event.clientY;

  }


  return {

    x:
      (
        clientX -
        rect.left
      ) *
      (
        canvas.width /
        rect.width
      ),


    y:
      (
        clientY -
        rect.top
      ) *
      (
        canvas.height /
        rect.height
      )

  };

}


/* =========================================================
   START SIGNATURE
========================================================= */

function startSignature(
  event
) {

  event.preventDefault();


  drawing = true;


  const ctx =
    canvas.getContext(
      "2d"
    );


  const point =
    getCanvasPoint(
      event
    );


  ctx.beginPath();


  ctx.moveTo(
    point.x,
    point.y
  );

}


/* =========================================================
   DRAW SIGNATURE
========================================================= */

function drawSignature(
  event
) {

  if (!drawing) {

    return;

  }


  event.preventDefault();


  const ctx =
    canvas.getContext(
      "2d"
    );


  const point =
    getCanvasPoint(
      event
    );


  ctx.lineTo(
    point.x,
    point.y
  );


  ctx.stroke();


  hasSignature =
    true;

}


/* =========================================================
   STOP SIGNATURE
========================================================= */

function stopSignature() {

  drawing = false;

}


/* =========================================================
   CLEAR SIGNATURE
========================================================= */

function clearSignature() {

  if (!canvas) {

    return;

  }


  const ctx =
    canvas.getContext(
      "2d"
    );


  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  hasSignature =
    false;

}


/* =========================================================
   FORM INITIALIZATION
========================================================= */

function initializeForm() {

  if (!form) {

    console.error(
      "Registration form not found."
    );


    return;

  }


  form.addEventListener(
    "submit",
    handleSubmit
  );

}


/* =========================================================
   HANDLE SUBMIT
========================================================= */

async function handleSubmit(
  event
) {

  event.preventDefault();


  console.log(
    "Final registration submission started."
  );


  /*
   * Validate Step 4
   */

  if (
    !validateStep(4)
  ) {

    return;

  }


  const submitButton =
    document.getElementById(
      "submitBtn"
    );


  if (submitButton) {

    submitButton.disabled =
      true;


    submitButton.textContent =
      "Submitting...";

  }


  try {

    /*
     * Build payload
     */

    const payload =
      await buildPayload();


    console.log(
      "Payload prepared."
    );


    /*
     * Send to Google Apps Script
     */

    const response =
      await fetch(
        API_URL,
        {
          method:
            "POST",

          headers: {

            "Content-Type":
              "text/plain;charset=utf-8"

          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    console.log(
      "Google Apps Script HTTP status:",
      response.status
    );


    /*
     * IMPORTANT:
     *
     * Read text first.
     *
     * Do NOT directly call response.json().
     */

    const responseText =
      await response.text();


    console.log(
      "Google Apps Script raw response:",
      responseText
    );


    /*
     * Check empty response
     */

    if (
      !responseText
    ) {

      throw new Error(
        "Google Apps Script returned an empty response."
      );

    }


    /*
     * Parse JSON
     */

    let result;


    try {

      result =
        JSON.parse(
          responseText
        );

    } catch (jsonError) {

      console.error(
        "The server returned non-JSON data:"
      );


      console.error(
        responseText
      );


      throw new Error(
        "The BAASH server returned an HTML/error page instead of JSON. Check the Apps Script deployment and Web App URL."
      );

    }


    /*
     * Server-side failure
     */

    if (
      result.success !== true &&
      result.ok !== true
    ) {

      throw new Error(
        result.error ||
        result.message ||
        "Registration submission failed."
      );

    }


    /*
     * SUCCESS
     */

    showSuccess(
      result.registrationId
    );


  } catch (error) {

    console.error(
      "REGISTRATION ERROR:",
      error
    );


    alert(
      error.message ||
      "Unable to submit registration."
    );


    if (submitButton) {

      submitButton.disabled =
        false;


      submitButton.textContent =
        "Submit Registration";

    }

  }

}


/* =========================================================
   BUILD PAYLOAD
========================================================= */

async function buildPayload() {

  const payload = {};


  /*
   * Normal form fields
   */

  const normalFields = [

    "venueName",

    "natureOfBusiness",

    "venueAddress",

    "city",

    "state",

    "pinCode",

    "legalName",

    "ownerName",

    "ownerEmail",

    "ownerMobile",

    "gstNumber",

    "panNumber"

  ];


  normalFields.forEach(
    function(name) {

      const element =
        form.elements[name];


      if (element) {

        payload[name] =
          String(
            element.value || ""
          ).trim();

      }

    }
  );


  /*
   * Documents
   */

  payload.files =
    await collectFiles();


  /*
   * Agreement
   */

  const signatureName =
    document.getElementById(
      "signatureName"
    );


  const agreementAccepted =
    document.getElementById(
      "agreementAccepted"
    );


  payload.contract = {

    accepted:
      agreementAccepted
        ? agreementAccepted.checked
        : false,

    version:
      "DEMO-1.0",

    signerName:
      signatureName
        ? signatureName.value.trim()
        : "",

    signatureDataUrl:
      canvas
        ? canvas.toDataURL(
            "image/png"
          )
        : ""

  };


  return payload;

}


/* =========================================================
   COLLECT DOCUMENTS
========================================================= */

async function collectFiles() {

  const fileNames = [

    "tradeLicense",

    "gstCertificate",

    "ownerAadhaar",

    "businessPan",

    "cancelledCheque",

    "otherLicense"

  ];


  const files = {};


  for (
    const name
    of fileNames
  ) {

    const input =
      form.elements[name];


    if (
      input &&
      input.files &&
      input.files.length > 0
    ) {

      files[name] =
        await fileToBase64(
          input.files[0]
        );

    } else {

      files[name] =
        null;

    }

  }


  return files;

}


/* =========================================================
   FILE TO BASE64
========================================================= */

async function fileToBase64(
  file
) {

  if (!file) {

    return null;

  }


  /*
   * Maximum 10 MB
   */

  if (
    file.size >
    10 * 1024 * 1024
  ) {

    throw new Error(
      "File " +
      file.name +
      " is larger than 10 MB."
    );

  }


  const arrayBuffer =
    await file.arrayBuffer();


  const bytes =
    new Uint8Array(
      arrayBuffer
    );


  let binary =
    "";


  const chunkSize =
    0x8000;


  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {

    const chunk =
      bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      );


    binary +=
      String.fromCharCode(
        ...chunk
      );

  }


  return {

    name:
      file.name,

    type:
      file.type ||
      "application/octet-stream",

    data:
      btoa(
        binary
      )

  };

}


/* =========================================================
   SUCCESS SCREEN
========================================================= */

function showSuccess(
  registrationId
) {

  /*
   * Hide form
   */

  if (form) {

    form.style.display =
      "none";

  }


  /*
   * Hide progress
   */

  const progress =
    document.querySelector(
      ".progress"
    );


  if (progress) {

    progress.style.display =
      "none";

  }


  /*
   * Hide intro
   */

  const intro =
    document.querySelector(
      ".intro"
    );


  if (intro) {

    intro.style.display =
      "none";

  }


  /*
   * Registration ID
   */

  const idElement =
    document.getElementById(
      "registrationId"
    );


  if (idElement) {

    idElement.textContent =
      registrationId ||
      generateFallbackId();

  }


  /*
   * Show success
   */

  const successBox =
    document.getElementById(
      "successBox"
    );


  if (successBox) {

    successBox.classList.add(
      "show"
    );

  }


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   FALLBACK REGISTRATION ID
========================================================= */

function generateFallbackId() {

  const date =
    new Date();


  const pad =
    function(number) {

      return String(
        number
      ).padStart(
        2,
        "0"
      );

    };


  return (

    "BAASH-VEN-" +

    date.getFullYear() +

    pad(
      date.getMonth() + 1
    ) +

    pad(
      date.getDate()
    ) +

    "-" +

    Math.floor(
      1000 +
      Math.random() *
      9000
    )

  );

}
