"use client";

export default function FestivalBanner({
  festival,
  timeLeft
}: any){

  if(!festival) return null;

  return(

    <div className="w-full overflow-hidden mt-3 shadow-sm">

      {/* IMAGE */}
      {festival.image && (
        <img
          src={festival.image}
          className="w-full h-[100px] object-cover"
        />
      )}

      {/* TITLE + TIMER */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2">

        <h2 className="font-semibold text-sm">
          {festival.title}
        </h2>

        {timeLeft && (
          <div className="flex gap-2 mt-1 text-[11px] font-semibold">
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
          </div>
        )}

      </div>

    </div>

  );

}
