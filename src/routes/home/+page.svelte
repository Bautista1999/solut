<script>
    var countDownDate = new Date("Mar 15, 2024 00:00:00").getTime();
    let today = new Date();
    let monthEl = today.getMonth() + 1;
    let dayEl = today.getDay();
    let yearEl = today.getFullYear();
    let hoursEl = today.getHours();
    let minutesEl = today.getMinutes();
    let secondsEl = today.getSeconds();
    const monthsElement = document.getElementById("month");
    const daysElement = document.getElementById("day");
    const hoursElement = document.getElementById("hour");
    const minutesElement = document.getElementById("minute");
    const secondsElement = document.getElementById("second");

    // Update the count down every 1 second
    var x = setInterval(function () {
        // Get today's date and time
        let today = new Date().getTime();

        // Find the distance between now and the count down date
        let interval = countDownDate - today;

        // Time calculations for days, hours, minutes and seconds
        let months = Math.floor(interval / (1000 * 60 * 60 * 24 * 30));
        let days = 30 % Math.floor(interval / (1000 * 60 * 60 * 24));
        let hours = Math.floor(
            (interval % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        let minutes = Math.floor((interval % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((interval % (1000 * 60)) / 1000);

        monthEl = months;
        dayEl = days;
        hoursEl = hours;
        minutesEl = minutes;
        secondsEl = seconds;

        // If the count down is finished, write some text
        if (interval < 0) {
            clearInterval(x);
            // @ts-ignore
            document.getElementById("new").innerHTML =
                "HAPPY NEW YEAR ! TIME FOR A NEW BEGINNING";
        }
    }, 1000);
</script>

<body class="bg-slate-700 flex items-center justify-center min-h-screen">
    <!-- First Layer -->
    <div
        class="w-full sm:max-w-2xl bg-slate-900 text-white h-[25rem] px-4 rounded py-4"
    >
        <!-- Second Layer -->
        <div
            id="new"
            class="bg-[url('https://static01.nyt.com/images/2022/01/21/us/00xp-Lava-vid-cove-mike-ives-is-has-answers/00xp-Lava-vid-cove-mike-ives-is-has-answers-superJumbo.jpg')] rounded h-full bg-cover"
        >
            <h2 class="text-2xl text-center font-semibold mb-10 pt-7">
                Until New Beginning
            </h2>
            <div
                class="flex justify-around text-center [&>*>h2]:text-xl [&>*>h2]:sm:text-4xl [&>*>h2]:font-bold [&>*>p]:text-sm [&>*>p]:font-semibold"
            >
                <div>
                    <h2 id="month">{monthEl}</h2>
                    <p>Month</p>
                </div>

                <div>
                    <h2 id="day">{dayEl}</h2>
                    <p>days</p>
                </div>

                <div>
                    <h2 id="hour">{hoursEl}</h2>
                    <p>Hours</p>
                </div>

                <div>
                    <h2 id="minute">{minutesEl}</h2>
                    <p>Minutes</p>
                </div>

                <div>
                    <h2 id="second">{secondsEl}</h2>
                    <p>Seconds</p>
                </div>
            </div>
        </div>
    </div>

    <script src="index.js"></script>
</body>
