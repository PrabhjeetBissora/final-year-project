function timeConversionToMinutes(duration){

    // console.log("----------------------IN TIME CONVERSION --------------------------------");


    // console.log("duration=", duration);
    let hours = duration.match(/(\d+)\s*(H|hour|hours)/i);
    let minutes = duration.match(/(\d+)\s*(M|min|mins)/i);
    // console.log("hours=", hours);
    // console.log("minutes=", minutes);
    let parsedHours = hours ? parseInt(hours[1]): 0;
    let parsedMinutes = minutes ? parseInt(minutes[1]): 0;

    return ((parsedHours * 60) + parsedMinutes);
};

console.log(timeConversionToMinutes("21 mins"))