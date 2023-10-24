<script>
    export let msg = "Signed in successfully!";
</script>

<div class="loginBlock">
    <div class="loginContent">
        <img
            src="/assets/correct.png"
            alt=""
            style="width:35%; margin:20px;"
            class="centered-image"
        />
        <h3>{msg}</h3>
        <div class="textbody">
            <p>Going back to the page...</p>
        </div>

        <br />
    </div>
</div>

<style>
    .textbody {
        text-align: left;
    }

    .loginBlock {
        display: flex;
        justify-content: center;
        width: 100%;
        z-index: 0;
        margin-top: 1cm;
        margin-bottom: 1cm;
    }

    .loginContent {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: white;
        border-color: black;
        border-width: 2px;
        width: fit-content;
        height: fit-content;
        padding-top: 7px;
        box-shadow: 10px 10px 0px rgba(0, 0, 0, 1);
        color: rgb(0, 91, 91);
    }
    @media (max-width: 768px) {
        .loginContent {
            width: 90%; /* Adjust the width for smaller screens */
            box-shadow: 5px 5px 0px rgba(0, 0, 0, 1); /* Adjust the box-shadow for smaller screens */
        }
        .loginBlock {
            display: flex;
            justify-content: center;
            width: 100%;
            margin-top: 1cm;
            z-index: 0;
        }
    }
</style>
