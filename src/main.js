const props = {
    "companyId": "d0fb30bf-0a21-4d6a-89ae-bc711db0876f",
    "loginPolicyId": "QXDINbUCTlmLl2xpfrbtVm4re9S2kiPI",
    "preferencesPolicyId": "593fsggtW8x0bUAPvgNrxdpvrKnhrH1f",
    "apiKey": "B8ZpyzPyK5sNip1NFKtka5nEI3hZkzT05J9NKRTKm7AFMV5gzWhi891GHPOFgJL8ycb5QpdkvlKlCDOsSEyiv0SnSLLqp23SfFiqXUN0c0qkoevOlFmV3RpfJEIdNrYlM0in5mul4jVuQGTDMWlr6RkROdg7adFPBwAskHANmaZe6SveXuFN3L3NjleXLWuOVOsjekCeF5BcYtt07GJSpkVGXKRy31BIwyZfq7w4hS3GS1HvHhBdwBXnd63PYOIP"
}

let token;
let skWidget;
let idTokenClaims;

window.onload = async () => {
    console.log("onload");
    document.getElementById("home").addEventListener("click", () => startLogin());
    document.getElementById("username").addEventListener("click", () => startProfileUpdate());
    if (window.location.hash) {
        handleRedirectBack();
    } else {
        await getToken();
        skWidget = document.getElementsByClassName("skWidget")[0];
    }
}

async function startProfileUpdate() {
    console.log("startProfileUpdate");

    let parameters = {
        'username': idTokenClaims.username
    }
    showWidget(props.preferencesPolicyId, porfileChangeSuccessCallback, errorCallback, onCloseModal, parameters);
}

async function startLogin() {
    console.log("startLogin");
    showWidget(props.loginPolicyId, successCallback, errorCallback, onCloseModal);
}

async function logout() {
    console.log("logout");
    idTokenClaims = null;
    updateUI(false);
}

async function getToken() {
    console.log("getToken");

    const url = "https://api.singularkey.com/v1/company/" + props.companyId + "/sdkToken";
    let response = await fetch(url, {
        method: "GET",
        headers: {
            "X-SK-API-KEY": props.apiKey
        }
    });

    token = await response.json();
    console.log(token);
}

async function showWidget(policyId, successCallback, errorCallback, onCloseModal, parameters) {
    console.log("showWidget");
    let widgetConfig = {
        config: {
            method: "runFlow",
            apiRoot: "https://api.singularkey.com/v1",
            accessToken: token.access_token,
            companyId: props.companyId,
            policyId: policyId,
            parameters: parameters
        },
        useModal: true,
        successCallback,
        errorCallback,
        onCloseModal
    };

    singularkey.skRenderScreen(skWidget, widgetConfig);
}

function porfileChangeSuccessCallback(response) {
    console.log("porfileChangeSuccessCallback");
    singularkey.cleanup(skWidget);
}

function successCallback(response) {
    console.log("successCallback");
    console.log(response);
    singularkey.cleanup(skWidget);
    idTokenClaims = response.additionalProperties;
    updateUI(true);
}

function errorCallback(error) {
    console.log("errorCallback");
    console.log(error);
    singularkey.cleanup(skWidget);
}

function onCloseModal() {
    console.log("onCloseModal");
    singularkey.cleanup(skWidget)
}

function updateUI(isUserAuthenticated) {
    console.log("updateUI. Is user authenticated " + isUserAuthenticated);

    if (isUserAuthenticated) {
        showPage("dashboard");
        document.getElementById("username").innerText = getDisplayName(idTokenClaims);
        document.getElementById("navbar").classList.remove("hidden");
    } else {
        document.getElementById("username").innerText = "Account";
        eachElement(".auth", (e) => e.style.display = "none");
        eachElement(".non-auth", (e) => e.style.display = "block");
    }
}

function getDisplayName(claims) {
    if (claims.given_name) {
        return claims.given_name;
    }

    return claims.email;
}

function showPage(idToShow) {
    hideAll();
    document.getElementById(idToShow).style.display = "block";
}

function hideAll() {
    console.log("hideAll");
    document.querySelectorAll(".home-image").forEach((e) => e.style.display = "none");
}

function eachElement(selector, fn) {
    for (let e of document.querySelectorAll(selector)) {
        fn(e);
    }
}