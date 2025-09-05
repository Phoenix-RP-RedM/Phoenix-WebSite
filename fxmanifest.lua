-- #############################################################################
-- #                                                                           #
-- #             __________._                         .__                      #
-- #            \______   \  |__   ____   ____   ____ |__|__  ___              #
-- #             |     ___/  |  \ /  _ \_/ __ \ /    \|  \  \/  /              #
-- #             |    |   |   Y  (  <_> )  ___/|   |  \  |>    <               #
-- #             |____|   |___|  /\____/ \___  >___|  /__/__/\_ \              #
-- #                           \/            \/     \/         \/              #
-- #                                                                           #
-- #############################################################################

-- Needs Phoenix-Core and Phoenix-Sync --

fx_version "cerulean"
game "rdr3"
rdr3_warning "I acknowledge that this is a prerelease build of RedM, and I am aware my resources *will* become incompatible once RedM ships."

name "Phoenix--[NAME_MODULE_HERE]"
description "[NAME_MODULE_HERE] a module for the phoenix framework - [SHORT_DESC_HERE] - Proudly made by Phoenix Team: See credits for more informations."
author "Phoenix team - https://github.com/Phoenix-RP-RedM"
version "0.1.0"

lua54 "yes"

shared_script {
  "[ Shared ]/*.lua",
}

client_scripts {
  "[ Language ]/*.lua",
  "[ Client ]/*.lua",
}

server_scripts {
  "[ Server ]/*.lua",
}
