const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const router = express.Router();

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

router.get("/:id", async (req, res) => {

    const fixtureId = req.params.id;

    try{

        const response = await fetch(
            `${BASE_URL}/fixtures/events?fixture=${fixtureId}`,
            {
                headers:{
                    "x-apisports-key":API_KEY
                }
            }
        );

        const data = await response.json();

        const events=(data.response||[]).map(event=>({

            time:event.time,

            team:event.team,

            player:event.player,

            assist:event.assist,

            type:event.type,

            detail:event.detail,

            comments:event.comments

        }));

        res.json({

            success:true,

            events

        });

    }

    catch(err){

        res.json({

            success:false,

            events:[]

        });

    }

});

module.exports=router;