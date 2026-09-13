const API_URL = "https://script.google.com/macros/s/AKfycbxCttSaWEs7dsnd-vusjdLvyPyqerUGst00W9qcYS5NvC38yEtprGT8pXc2JGohOEo/exec";

let currentStep = 1;
const form = document.getElementById("registrationForm");

const formSteps = Array.from(
  document.querySelectorAll(".form-step")
);

const progressItems = Array.from(
  document.querySelectorAll(".progress-item")
);


/* =========================================================
   STEP NAVIGATION
========================================================= */

function showStep(step) {

  if (step < 1 || step > formSteps.length) {
    return;
  }

  currentStep = step;

  formSteps.forEach(section => {
    const sectionStep = Number(section.dataset.step);

    section.classList.toggle(
      "active",
      sectionStep === step
    );
  });

  progressItems.forEach(item => {

    const itemStep =
      Number(item.dataset.step);

    item.classList.toggle(
      "active",
      itemStep === step
    );

    item.classList.toggle(
      "done",
      itemStep < step
    );

  });

  const stepNumber =
    document.getElementById("stepNumber");

  if (stepNumber) {
    stepNumber.textContent = step;
  }

  if (step === 4) {
    populateAgreement();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   VALIDATION
========================================================= */

function validateStep(step) {

  const section =
    document.querySelector(
      `.form-step[data-step="${step}"]`
    );

  if (!section) {
    return false;
  }

  /*
   * Validate only the fields that belong
   * to the current section.
   */
  const requiredFields =
    Array.from(
      section.querySelectorAll(
        "input[required], select[required], textarea[required]"
      )
    );

  for (const field of requiredFields) {

    /*
     * File inputs are handled separately.
     */
    if (field.type === "file") {

      if (!field.files || !field.files.length) {

        const card =
          field.closest(".upload-card");

        const title =
          card
            ? card.querySelector("strong")
            : null;

        alert(
          "Please upload " +
          (
            title
              ? title.textContent.trim()
              : "the required document"
          )
        );

        return false;
      }

      /*
       * 10 MB limit.
       */
      if (field.files[0].size > 10 * 1024 * 1024) {

        alert(
          "Each document must be less than 10 MB."
        );

        return false;
      }

      continue;
    }

    /*
     * Normal fields.
     */
    if (!field.checkValidity()) {

      field.reportValidity();

      return false;
    }

  }


  /*
   * Agreement-specific validation.
   */
  if (step === 4) {

    const accepted =
      document.getElementById(
        "agreementAccepted"
      );

    if (!accepted || !accepted.checked) {

      alert(
        "Please accept the demo vendor agreement."
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
        "Please enter your full legal name."
      );

      if (signatureName) {
        signatureName.focus();
      }

      return false;
    }


    if (!hasSignature) {

      alert(
        "Please draw your signature."
      );

      return false;
    }

  }

  return true;
}


/* =========================================================
   NEXT / BACK
========================================================= */

function nextStep() {

  console.log(
    "Next clicked. Current step:",
    currentStep
  );

  if (!validateStep(currentStep)) {
    return;
  }

  if (currentStep < formSteps.length) {

    showStep(
      currentStep + 1
    );

  }

}


function prevStep() {

  if (currentStep > 1) {

    showStep(
      currentStep - 1
    );

  }

}


/*
 * Explicitly attach navigation events.
 *
 * This avoids depending on inline onclick
 * handlers and makes navigation reliable.
 */
document.querySelectorAll(".next").forEach(button => {

  button.addEventListener(
    "click",
    function(event) {

      event.preventDefault();

      nextStep();

    }
  );

});


document.querySelectorAll(".prev").forEach(button => {

  button.addEventListener(
    "click",
    function(event) {

      event.preventDefault();

      prevStep();

    }
  );

});


/* =========================================================
   FILE UPLOAD DISPLAY
========================================================= */

document
  .querySelectorAll(
    '.upload-card input[type="file"]'
  )
  .forEach(input => {

    input.addEventListener(
      "change",
      function() {

        const card =
          input.closest(".upload-card");

        if (!card) {
          return;
        }

        const fileName =
          card.querySelector(".file-name");

        if (!fileName) {
          return;
        }

        fileName.textContent =
          input.files && input.files.length
            ? input.files[0].name
            : "Choose file";

      }
    );

  });


/* =========================================================
   AGREEMENT
========================================================= */

function populateAgreement() {

  const venue =
    form.elements.venueName
      ? form.elements.venueName.value
      : "";

  const legal =
    form.elements.legalName
      ? form.elements.legalName.value
      : "";

  const owner =
    form.elements.ownerName
      ? form.elements.ownerName.value
      : "";


  const venueElement =
    document.getElementById(
      "agreementVenue"
    );

  const legalElement =
    document.getElementById(
      "agreementLegal"
    );

  const ownerElement =
    document.getElementById(
      "agreementOwner"
    );


  if (venueElement) {
    venueElement.textContent =
      venue || "—";
  }

  if (legalElement) {
    legalElement.textContent =
      legal || "—";
  }

  if (ownerElement) {
    ownerElement.textContent =
      owner || "—";
  }


  const signatureName =
    document.getElementById(
      "signatureName"
    );


  if (
    signatureName &&
    !signatureName.value.trim()
  ) {

    signatureName.value =
      legal ||
      owner ||
      "";

  }

}


/* =========================================================
   SIGNATURE PAD
========================================================= */

const canvas =
  document.getElementById(
    "signaturePad"
  );

const ctx =
  canvas.getContext("2d");


ctx.lineWidth = 2.5;
ctx.lineCap = "round";
ctx.lineJoin = "round";


let drawing = false;
let hasSignature = false;


function getCanvasPoint(event) {

  const rect =
    canvas.getBoundingClientRect();


  let clientX;
  let clientY;


  if (
    event.touches &&
    event.touches.length
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
      (clientX - rect.left) *
      (canvas.width / rect.width),

    y:
      (clientY - rect.top) *
      (canvas.height / rect.height)

  };

}


function startSignature(event) {

  event.preventDefault();

  drawing = true;

  const point =
    getCanvasPoint(event);

  ctx.beginPath();

  ctx.moveTo(
    point.x,
    point.y
  );

}


function drawSignature(event) {

  if (!drawing) {
    return;
  }

  event.preventDefault();

  const point =
    getCanvasPoint(event);

  ctx.lineTo(
    point.x,
    point.y
  );

  ctx.stroke();

  hasSignature = true;

}


function stopSignature() {

  drawing = false;

}


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


canvas.addEventListener(
  "touchstart",
  startSignature,
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  drawSignature,
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  stopSignature
);


document
  .getElementById(
    "clearSignature"
  )
  .addEventListener(
    "click",
    function() {

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      hasSignature = false;

    }
  );


/* =========================================================
   FILE → BASE64
========================================================= */

async function fileToBase64(file) {

  if (!file) {
    return null;
  }

  const bytes =
    await file.arrayBuffer();

  let binary = "";

  const chunkSize = 0x8000;


  for (
    let i = 0;
    i < bytes.byteLength;
    i += chunkSize
  ) {

    binary += String.fromCharCode(
      ...new Uint8Array(
        bytes,
        i,
        Math.min(
          chunkSize,
          bytes.byteLength - i
        )
      )
    );

  }


  return {

    name: file.name,

    type:
      file.type ||
      "application/octet-stream",

    data: btoa(binary)

  };

}


/* =========================================================
   COLLECT FILES
========================================================= */

async function collectFiles() {

  const names = [

    "tradeLicense",
    "gstCertificate",
    "ownerAadhaar",
    "businessPan",
    "cancelledCheque",
    "otherLicense"

  ];


  const files = {};


  for (const name of names) {

    const input =
      form.elements[name];

    files[name] =
      await fileToBase64(
        input &&
        input.files &&
        input.files.length
          ? input.files[0]
          : null
      );

  }


  return files;

}


/* =========================================================
   SUBMIT
========================================================= */

form.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    if (!validateStep(4)) {
      return;
    }


    const submitButton =
      document.getElementById(
        "submitBtn"
      );


    submitButton.disabled = true;

    submitButton.textContent =
      "Submitting...";


    try {

      if (
        API_URL.includes(
          "PASTE_YOUR"
        )
      ) {

        throw new Error(
          "Please configure the Google Apps Script URL in script.js first."
        );

      }


      const payload = {};


      const formData =
        new FormData(form);


      for (
        const [key, value]
        of formData.entries()
      ) {

        if (
          !(value instanceof File)
        ) {

          payload[key] =
            value;

        }

      }


      payload.files =
        await collectFiles();


      payload.contract = {

        accepted: true,

        version: "DEMO-1.0",

        signerName:
          document
            .getElementById(
              "signatureName"
            )
            .value
            .trim(),

        signatureDataUrl:
          canvas.toDataURL(
            "image/png"
          )

      };


      const response =
        await fetch(

          API_URL,

          {

            method: "POST",

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


      const result =
        await response.json();


      if (
        !result.success &&
        !result.ok
      ) {

        throw new Error(
          result.error ||
          "Submission failed."
        );

      }


      showSuccess(
        result.registrationId
      );


    } catch (error) {

      console.error(error);

      alert(
        error.message ||
        "Unable to submit registration."
      );

      submitButton.disabled =
        false;

      submitButton.textContent =
        "Submit Registration";

    }

  }
);


/* =========================================================
   SUCCESS
========================================================= */

function showSuccess(
  registrationId
) {

  form.style.display =
    "none";


  const progress =
    document.querySelector(
      ".progress"
    );

  if (progress) {
    progress.style.display =
      "none";
  }


  const intro =
    document.querySelector(
      ".intro"
    );

  if (intro) {
    intro.style.display =
      "none";
  }


  const idElement =
    document.getElementById(
      "registrationId"
    );

  if (idElement) {

    idElement.textContent =
      registrationId ||
      generateId();

  }


  const successBox =
    document.getElementById(
      "successBox"
    );

  if (successBox) {

    successBox.classList.add(
      "show"
    );

  }

}


function generateId() {

  const date =
    new Date();

  const pad =
    number =>
      String(number)
        .padStart(2, "0");


  return (

    "BAASH-VEN-" +

    date.getFullYear() +

    pad(date.getMonth() + 1) +

    pad(date.getDate()) +

    "-" +

    Math.floor(
      1000 +
      Math.random() * 9000
    )

  );

}


/* =========================================================
   INITIAL STATE
========================================================= */

showStep(1);
