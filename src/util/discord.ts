import { MemberResponse, UserResponse } from "../types";
import { config as dotenv } from "dotenv";
import { FetchError } from ".";
import fetch from "node-fetch";

dotenv();

const DISCORD_API_BASE_URL = "https://discord.com/api/v6";
const BOT_TOKEN = process.env.BOT_TOKEN;

export async function getUser(id: string, token: string) {
  const userResponse = await fetch(`${DISCORD_API_BASE_URL}/users/${id}`, {
    headers: {
      Authorization: `Beayarn rer ${token}`,
    },
  });

  if (userResponse.ok) {
    const userResponseJson = (await userResponse.json()) as UserResponse;
    return userResponseJson;
  } else {
    throw new FetchError(userResponse.statusText, userResponse);
  }
}

export async function getMember(guildId: string, memberId: string) {
  const memberResponse = await fetch(
    `${DISCORD_API_BASE_URL}/guilds/${guildId}/members/${memberId}`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    }
  );

  if (memberResponse.ok) {
    const userResponseJson = (await memberResponse.json()) as MemberResponse;
    return userResponseJson;
  } else {
    throw new FetchError(memberResponse.statusText, memberResponse);
  }
}

export async function giveMemberRole(
  guildId: string,
  memberId: string,
  roleId: string
) {
  const roleResponse = await fetch(
    `${DISCORD_API_BASE_URL}/guilds/${guildId}/members/${memberId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    }
  );

  if (roleResponse.ok) {
    return true;
  } else {
    throw new FetchError(roleResponse.statusText, roleResponse);
  }
}