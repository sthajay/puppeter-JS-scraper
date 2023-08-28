import puppeteer from 'puppeteer';
import fs from 'fs/promises';

import { importJobs } from './importer';
import { fetchJobInfos } from './scraper';
(async () => {
  // Import from config
  const companies = ['netflix'];

  const BRIGHT_DATA_PROXY = 'zproxy.lum-superproxy.io';

  const BRIGHT_DATA_PORT = 22225;

  const BRIGHT_DATA_USERNAME = 'brd-customer-hl_8354bbb6-zone-husslup_zone1';

  const BRIGHT_DATA_PASSWORD = 'pt0w4v1s25wq';

  //   const proxyUrl = `http://${BRIGHT_DATA_USERNAME}:${BRIGHT_DATA_PASSWORD}@${BRIGHT_DATA_PROXY}:${BRIGHT_DATA_PORT}`;

  const url = 'https://www.linkedin.com/company';
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--disable-features=site-per-process',
      '--headless',
      //`--proxy-server=${proxyUrl}`
    ],
  });
  const page = await browser.newPage();
  const totalJobs = [];

  for (const company of companies) {
    try {
      console.log(`Fetching Job Informations for : ${company}`);
      // await page.goto(`${url}/${company}`);
      // await page.waitForNavigation();
      await Promise.all([
        page.goto(`${url}/${company}`, { timeout: 60000 }),
        page.waitForSelector('.top-card-layout__cta', { timeout: 60000 }),
      ]);

      // const modalCloseButton = await page.waitForSelector('button[aria-label="Dismiss"]');

      // console.log({ modalCloseButton });
      // if (modalCloseButton) {
      //   await modalCloseButton.click();
      // }
      // await page.waitForNavigation();z
      //   await page.waitForSelector('.top-card-layout__cta');
      const companyTag = await page.$eval('.top-card-layout__cta', (element) =>
        element.getAttribute('href'),
      );
      const match = companyTag.match(/f_C=(\d+)/);
      if (companyTag) {
        if (match) {
          const companyCode = match[1];
          // const jobIds = await importJobs(companyCode, page);
          // const jobIds = [];
          const [_, jobIds] = await Promise.all([
            page.waitForNavigation(),
            importJobs(companyCode, page),
          ]);
          if (jobIds.length > 0) totalJobs.push(jobIds);
        }
      }
    } catch (error) {
      console.log(`No Jobs for ${company}`);
      console.log({ error });
    }
  }
  // if (totalJobs.length > 0) {
  //   const jobs = [].concat(...totalJobs);
  //   console.log({ jobs });
  //   const jobDetails = await fetchJobInfos(browser, jobs);

  //   const indexedJobDetails = jobDetails.map((job, index) => ({ ...job, index: index + 1 }));

  //   const csvData = indexedJobDetails
  //     .map((job) => `${job.index},${job.job_id},${job.job_title},...`)
  //     .join('\n');
  //   try {
  //     await fs.writeFile('linkedin_jobs.csv', csvData, 'utf-8');
  //     console.log(`${jobDetails.length} jobs imported.`);
  //     await browser.close();
  //   } catch (err) {
  //     console.error('Error writing CSV file:', err);
  //   }
  // }

  await browser.close();
})();
