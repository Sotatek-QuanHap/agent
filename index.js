const osu = require('node-os-utils');
const cpu = osu.cpu;
const drive = osu.drive;
const mem = osu.mem;
require('dotenv').config();
const moment = require('moment');

const sgMail = require('@sendgrid/mail');

async function run() {
    try {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        let total_cpu = cpu.count();
        let usage_cpu = await cpu.usage(5000);
        const disk = await drive.info();
        let mem_info = await mem.info();

        console.log({
            total_cpu: total_cpu,
            usage_cpu_percentage: usage_cpu,
            total_disk: disk.totalGb,
            usage_disk: disk.usedGb,
            total_memory: mem_info.totalMemMb,
            usage_memory: mem_info.usedMemMb
        });

        if (usage_cpu > 80 || disk.usedGb / disk.totalGb > 0.8 || mem_info.usedMemMb / mem_info.totalMemMb > 0.8) {
            await sgMail.send({
                to: process.env.EMAIL_RECEIVER || 'quan.hap@sotatek.com',
                from: process.env.EMAIL_SENDER,
                subject: 'Agent Notification',
                text: 'Please check server'
            });
        }
        console.log('Check at:', moment().utcOffset(+7).format('HH:mm:ss YYYY-MM-DD'));
    } catch (e) {
        console.log(e);
    }
}

async function setIntervalAndExecute(fn, t) {
    console.log('Start send resource of system');
    await fn();
    return setInterval(fn, t);
}

setIntervalAndExecute(run, 1 * 60 * 1000);
