import axios from 'axios';

export interface DiscordUserCountData {
  discordUserCount: number;
}

const url = 'https://discord.com/api/invites/luckperms?with_counts=true';

export async function fetchData(): Promise<DiscordUserCountData> {
  const resp = (await axios.get(url)).data;

  const discordUserCount = resp.approximate_member_count;
  return { discordUserCount };
}
