/* =========================================================
   BAASH REGISTRATION FRONTEND
========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxMz48LASOHJ4lMvArhtYQpjl-Kp-GSVRN0CN_6YSL8yBAWHJ7ayAK9FejV7H8Br-77/exec";

let currentStep = 1;
let hasSignature = false;

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


/* =========================================================
   STEP NAVIGATION
========================================================= */

function showStep(step) {

  if (
    step < 1 ||
    step > formSteps.length
  ) {
    return;
  }


  currentStep = step;


  formSteps.forEach(section => {

    const sectionStep =
      Number(
        section.dataset.step
      );

    section.classList.toggle(
      "active",
      sectionStep === step
    );

  });


  progressItems.forEach(item => {

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

  });


  const stepNumber =
    document.getElementById(
      "stepNumber"
    );


  if (stepNumber) {

    stepNumber.textContent =
      step;

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
   VALIDATE CURRENT STEP
========================================================= */

function validateStep(step) {

  const section =
    document.querySelector(
      `.form-step[data-step="${step}"]`
    );


  if (!section) {

    return false;

  }


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


    /* FILE */

    if (
      field.type === "file"
    ) {

      if (
        !field.files ||
        !field.files.length
      ) {

        const card =
          field.closest(
            ".upload-card"
          );


        const title =
          card
            ? card.querySelector(
                "strong"
              )
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


    /* CHECKBOX */

    if (
      field.type === "checkbox"
    ) {

      if (!field.checked) {

        field.focus();

        alert(
          "Please confirm the required declaration."
        );

        return false;

      }


      continue;

    }


    /* NORMAL INPUT */

    if (
      !field.value.trim()
    ) {

      field.focus();

      alert(
        "Please complete all required fields."
      );

      return false;

    }


    if (
      !field.checkValidity()
    ) {

      field.reportValidity();

      return false;

    }

  }


  /* AGREEMENT */

  if (step === 4) {

    const accepted =
      document.getElementById(
        "agreementAccepted"
      );


    if (
      !accepted ||
      !accepted.checked
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

      signatureName.focus();

      return false;

    }


    if (!hasSignature) {

      alert(
        "Please draw your digital signature."
      );

      return false;

    }

  }


  return true;

}


/* =========================================================
   NEXT
========================================================= */

function nextStep() {

  console.log(
    "Continue clicked. Step:",
    currentStep
  );


  if (
    !validateStep(
      currentStep
    )
  ) {

    return;

  }


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
   BACK
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
   BUTTON EVENTS
========================================================= */

document
  .querySelectorAll(
    ".next"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      function(event) {

        event.preventDefault();

        nextStep();

      }
    );

  });


document
  .querySelectorAll(
    ".prev"
  )
  .forEach(button => {

    button.addEventListener(
      "click",
      function(event) {

        event.preventDefault();

        prevStep();

      }
    );

  });


/* =========================================================
   FILE NAME DISPLAY
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
          input.files.length
        ) {

          fileName.textContent =
            input.files[0].name;

        } else {

          fileName.textContent =
            "Choose file";

        }

      }
    );

  });


/* =========================================================
   AGREEMENT DATA
========================================================= */

function populateAgreement() {

  const venue =
    document.getElementById(
      "venueName"
    ).value.trim();


  const legal =
    document.getElementById(
      "legalName"
    ).value.trim();


  const owner =
    document.getElementById(
      "ownerName"
    ).value.trim();


  document.getElementById(
    "agreementVenue"
  ).value =
    venue || "—";


  document.getElementById(
    "agreementLegal"
  ).value =
    legal || "—";


  document.getElementById(
    "agreementOwner"
  ).value =
    owner || "—";


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
  canvas.getContext(
    "2d"
  );


ctx.lineWidth = 2.5;

ctx.lineCap =
  "round";

ctx.lineJoin =
  "round";


let drawing = false;


/* =========================================================
   SIGNATURE POSITION
========================================================= */

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
      (
        canvas.width /
        rect.width
      ),

    y:
      (clientY - rect.top) *
      (
        canvas.height /
        rect.height
      )

  };

}


/* =========================================================
   START SIGNATURE
========================================================= */

function startSignature(event) {

  event.preventDefault();

  drawing = true;


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
   DRAW
========================================================= */

function drawSignature(event) {

  if (!drawing) {
    return;
  }


  event.preventDefault();


  const point =
    getCanvasPoint(
      event
    );


  ctx.lineTo(
    point.x,
    point.y
  );


  ctx.stroke();


  hasSignature = true;

}


/* =========================================================
   STOP
========================================================= */

function stopSignature() {

  drawing = false;

}


/* =========================================================
   MOUSE EVENTS
========================================================= */

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


/* =========================================================
   TOUCH EVENTS
========================================================= */

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


/* =========================================================
   CLEAR SIGNATURE
========================================================= */

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


  const chunkSize =
    0x8000;


  for (
    let i = 0;
    i < bytes.byteLength;
    i += chunkSize
  ) {

    const chunk =
      new Uint8Array(
        bytes,
        i,
        Math.min(
          chunkSize,
          bytes.byteLength - i
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
      btoa(binary)

  };

}


/* =========================================================
   COLLECT DOCUMENTS
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


  for (
    const name
    of names
  ) {

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


    if (
      !validateStep(4)
    ) {

      return;

    }


    const submitButton =
      document.getElementById(
        "submitBtn"
      );


    submitButton.disabled =
      true;


    submitButton.textContent =
      "Submitting...";


    try {

      const formData =
        new FormData(form);


      const payload = {};


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


      /* DOCUMENTS */

      payload.files =
        await collectFiles();


      /* CONTRACT */

      payload.contract = {

        accepted: true,

        version:
          "DEMO-1.0",

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


      /* SEND TO APPS SCRIPT */

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
          "Registration submission failed."
        );

      }


      showSuccess(
        result.registrationId
      );


    } catch (error) {

      console.error(
        error
      );


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
   SUCCESS SCREEN
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


  document.getElementById(
    "registrationId"
  ).textContent =
    registrationId ||
    generateFallbackId();


  document
    .getElementById(
      "successBox"
    )
    .classList.add(
      "show"
    );

}


/* =========================================================
   FALLBACK ID
========================================================= */

function generateFallbackId() {

  const date =
    new Date();


  const pad =
    number =>
      String(number)
        .padStart(
          2,
          "0"
        );


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
      Math.random() * 9000
    )

  );

}


/* =========================================================
   START
========================================================= */

showStep(1);
